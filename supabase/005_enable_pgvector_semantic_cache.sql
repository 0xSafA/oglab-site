-- Enable pgvector extension for semantic caching
CREATE EXTENSION IF NOT EXISTS vector;

-- Create semantic_cache table for FAQ and similar queries
CREATE TABLE semantic_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT NOT NULL,
    query_embedding vector(1536),  -- OpenAI ada-002 embeddings (1536 dimensions)
    response_text TEXT NOT NULL,
    response_type TEXT DEFAULT 'faq',  -- 'faq' | 'product_info' | 'general'
    language TEXT DEFAULT 'en',
    hit_count INT DEFAULT 0,
    last_hit_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true
);

-- Create index for vector similarity search (cosine distance)
CREATE INDEX semantic_cache_embedding_idx ON semantic_cache 
USING ivfflat (query_embedding vector_cosine_ops)
WITH (lists = 100);

-- Create text search index
CREATE INDEX semantic_cache_query_text_idx ON semantic_cache USING gin(to_tsvector('english', query_text));

-- Create index for filtering
CREATE INDEX semantic_cache_language_idx ON semantic_cache(language);
CREATE INDEX semantic_cache_response_type_idx ON semantic_cache(response_type);
CREATE INDEX semantic_cache_is_active_idx ON semantic_cache(is_active) WHERE is_active = true;

-- Function to find similar cached queries
CREATE OR REPLACE FUNCTION find_similar_cached_queries(
    query_embedding vector(1536),
    similarity_threshold FLOAT DEFAULT 0.85,
    match_limit INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    query_text TEXT,
    response_text TEXT,
    similarity FLOAT,
    hit_count INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sc.id,
        sc.query_text,
        sc.response_text,
        1 - (sc.query_embedding <=> query_embedding) as similarity,
        sc.hit_count
    FROM semantic_cache sc
    WHERE 
        sc.is_active = true
        AND 1 - (sc.query_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY sc.query_embedding <=> query_embedding
    LIMIT match_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to increment hit count
CREATE OR REPLACE FUNCTION increment_cache_hit(cache_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE semantic_cache
    SET 
        hit_count = hit_count + 1,
        last_hit_at = now()
    WHERE id = cache_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_semantic_cache_updated_at
BEFORE UPDATE ON semantic_cache
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed with common FAQs (you'll need to generate embeddings for these)
-- Example structure (embeddings would be generated via OpenAI API)
INSERT INTO semantic_cache (query_text, response_text, response_type, language, query_embedding) VALUES
('What are your prices?', 'Our prices vary by strain and quantity. For flowers, we offer 1g, 5g, and 20g options. Prices start from ฿250/g. Check our menu for specific pricing!', 'faq', 'en', array_fill(0, ARRAY[1536])::vector),
('Where are you located?', 'OG Lab is located on Koh Samui island, Thailand. We offer delivery across the island. Contact us for exact address!', 'faq', 'en', array_fill(0, ARRAY[1536])::vector),
('Do you deliver?', 'Yes! We deliver across Koh Samui. Minimum order: 20g for flowers, 10g for hash. Delivery fee depends on location.', 'faq', 'en', array_fill(0, ARRAY[1536])::vector),
('What payment methods do you accept?', 'We accept cash, bank transfer, and cryptocurrency (Bitcoin, USDT, Ethereum).', 'faq', 'en', array_fill(0, ARRAY[1536])::vector),
('How long does delivery take?', 'Delivery usually takes 30-60 minutes depending on your location on the island.', 'faq', 'en', array_fill(0, ARRAY[1536])::vector);

-- Russian FAQs
INSERT INTO semantic_cache (query_text, response_text, response_type, language, query_embedding) VALUES
('Какие у вас цены?', 'Наши цены зависят от сорта и количества. Для цветов мы предлагаем опции 1г, 5г и 20г. Цены начинаются от ฿250/г. Посмотрите наше меню для конкретных цен!', 'faq', 'ru', array_fill(0, ARRAY[1536])::vector),
('Где вы находитесь?', 'OG Lab находится на острове Самуи, Таиланд. Мы доставляем по всему острову. Свяжитесь с нами для точного адреса!', 'faq', 'ru', array_fill(0, ARRAY[1536])::vector),
('Вы доставляете?', 'Да! Мы доставляем по всему Самуи. Минимальный заказ: 20г для цветов, 10г для гашиша. Стоимость доставки зависит от локации.', 'faq', 'ru', array_fill(0, ARRAY[1536])::vector),
('Какие способы оплаты вы принимаете?', 'Мы принимаем наличные, банковский перевод и криптовалюту (Bitcoin, USDT, Ethereum).', 'faq', 'ru', array_fill(0, ARRAY[1536])::vector);

-- Thai FAQs
INSERT INTO semantic_cache (query_text, response_text, response_type, language, query_embedding) VALUES
('ราคาเท่าไหร่?', 'ราคาของเราขึ้นอยู่กับสายพันธุ์และปริมาณ สำหรับดอก เรามี 1g, 5g และ 20g ราคาเริ่มต้นที่ ฿250/g ดูเมนูของเราสำหรับราคาที่แน่นอน!', 'faq', 'th', array_fill(0, ARRAY[1536])::vector),
('คุณอยู่ที่ไหน?', 'OG Lab ตั้งอยู่ที่เกาะสมุย ประเทศไทย เราจัดส่งทั่วเกาะ ติดต่อเราสำหรับที่อยู่ที่แน่นอน!', 'faq', 'th', array_fill(0, ARRAY[1536])::vector),
('คุณส่งของไหม?', 'ใช่! เราจัดส่งทั่วเกาะสมุย คำสั่งซื้อขั้นต่ำ: 20g สำหรับดอก, 10g สำหรับ hash ค่าจัดส่งขึ้นอยู่กับสถานที่', 'faq', 'th', array_fill(0, ARRAY[1536])::vector);

-- Comments
COMMENT ON TABLE semantic_cache IS 'Semantic cache for FAQ and common queries using pgvector';
COMMENT ON COLUMN semantic_cache.query_embedding IS 'OpenAI ada-002 embedding (1536 dimensions)';
COMMENT ON FUNCTION find_similar_cached_queries IS 'Find semantically similar cached queries using cosine similarity';

