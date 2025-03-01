INSERT INTO `balances` (
        `id`,
        `shop_id`,
        `admin_commission_rate`,
        `total_earnings`,
        `withdrawn_amount`,
        `current_balance`,
        `payment_info`,
        `created_at`,
        `updated_at`
    )
VALUES (
        1,
        1,
        10,
        1233,
        0,
        1233,
        '{\"bank\": \"Bank1\", \"name\": \"furniture shop\", \"email\": \"furniture@demo.com\", \"account\": 1121213131414141}',
        '2021-06-27 08:54:32',
        '2023-10-25 05:44:37'
    ),
    (
        4,
        6,
        10,
        0,
        0,
        0,
        '{\"name\":\"Grocery Shop\",\"email\":\"grocery@demo.com\",\"bank\":\"Bank6\",\"account\":231321635465465}',
        '2021-06-28 03:48:49',
        '2023-10-19 07:05:23'
    ),
    (
        5,
        5,
        10,
        0,
        0,
        0,
        '{\"bank\": \"Bank5\", \"name\": \"Bakery Shop\", \"email\": \"bakery@demo.com\", \"account\": 86453213548641330}',
        '2021-06-28 03:49:25',
        '2021-06-30 14:23:05'
    ),
    (
        6,
        4,
        10,
        167.4,
        0,
        167.4,
        '{\"name\":\"Makeup Shop\",\"email\":\"makeup@demo.com\",\"bank\":\"Bank4\",\"account\":5621030364876100000}',
        '2021-06-28 03:49:56',
        '2023-10-25 05:33:59'
    ),
    (
        7,
        3,
        10,
        369,
        0,
        369,
        '{\"name\":\"Bag Shop\",\"email\":\"bag@demo.com\",\"bank\":\"Bank3\",\"account\":632145987000364}',
        '2021-06-28 03:50:00',
        '2023-10-25 05:36:20'
    ),
    (
        8,
        2,
        10,
        0,
        0,
        0,
        '{\"name\":\"Clothing Shop\",\"email\":\"clothing@demo.com\",\"bank\":\"Bank2\",\"account\":1236521002454}',
        '2021-06-28 03:50:04',
        '2023-10-19 06:51:41'
    ),
    (
        9,
        7,
        10,
        1030.5,
        0,
        1030.5,
        '{\"name\":\"book shop\",\"email\":\"admin@example.com\",\"bank\":\"book bank\",\"account\":123456789}',
        '2021-12-07 16:47:07',
        '2023-10-16 04:27:06'
    ),
    (
        11,
        9,
        10,
        0,
        0,
        0,
        '{\"name\":\"John Doe\",\"email\":\"john_doe@example.com\",\"bank\":\"Bank of Huam\",\"account\":1127862923231234}',
        '2023-10-02 08:38:16',
        '2023-10-02 12:36:01'
    ),
    (
        13,
        11,
        10,
        0,
        0,
        0,
        '{\"name\":\"Robert Stone\",\"email\":\"rob.stone@example.com\",\"bank\":\"Bank of California\",\"account\":132314234543}',
        '2023-10-02 17:42:55',
        '2023-10-16 04:28:26'
    );