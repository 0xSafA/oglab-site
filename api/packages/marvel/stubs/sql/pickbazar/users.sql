INSERT INTO `users` (
        `id`,
        `name`,
        `email`,
        `email_verified_at`,
        `password`,
        `remember_token`,
        `created_at`,
        `updated_at`,
        `is_active`,
        `shop_id`
    )
VALUES (
        1,
        'Store Owner',
        'vendor@demo.com',
        NULL,
        '$2y$10$UVs.WftC2iIdLQsHz9Tbdu7OmUXG3P7wyjHvJqCunyJ7JE8ekyXr.',
        NULL,
        '2021-06-27 04:13:00',
        '2023-10-02 06:53:37',
        1,
        NULL
    ),
    (
        2,
        'Customer',
        'customer@demo.com',
        NULL,
        '$2y$10$UVs.WftC2iIdLQsHz9Tbdu7OmUXG3P7wyjHvJqCunyJ7JE8ekyXr.',
        NULL,
        '2021-08-18 10:30:29',
        '2021-08-18 13:17:53',
        1,
        NULL
    ),
    (
        4,
        'customer2',
        'customer2@demo.com',
        NULL,
        '$2y$10$UVs.WftC2iIdLQsHz9Tbdu7OmUXG3P7wyjHvJqCunyJ7JE8ekyXr.',
        NULL,
        '2022-03-17 14:15:08',
        '2022-03-17 14:15:08',
        1,
        NULL
    ),
    (
        5,
        'customer3',
        'customer3@demo.com',
        NULL,
        '$2y$10$UVs.WftC2iIdLQsHz9Tbdu7OmUXG3P7wyjHvJqCunyJ7JE8ekyXr.',
        NULL,
        '2022-03-17 16:25:39',
        '2022-03-17 16:25:39',
        1,
        NULL
    );