<?php

namespace oglab\Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;


class SettingsSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // run your app seeder
        DB::table('settings')->insert([
            'options' => json_encode([
                "seo" => [
                    'ogImage' => null,
                    'ogTitle' => null,
                    'metaTags' => null,
                    'metaTitle' => null,
                    'canonicalUrl' => null,
                    'ogDescription' => null,
                    'twitterHandle' => null,
                    'metaDescription' => null,
                    'twitterCardType' => null
                ],
                "logo" => [
                    'thumbnail' => 'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/2295/conversions/Logo-new-thumbnail.jpg',
                    'original' => 'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/2295/Logo-new.png',
                    'id' => 2298,
                    'file_name' => 'Logo-new.png'
                ],
                "collapseLogo" => [
                    'thumbnail' => 'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/2283/conversions/Pickbazar-thumbnail.jpg',
                    'original' => 'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/2283/Pickbazar.png',
                    'id' => 2286,
                    'file_name' => 'Pickbazar.png'
                ],
                "useOtp" => false,
                "currency" => "USD",
                "taxClass" => "1",
                "siteTitle" => "Pickbazar",
                "deliveryTime" => [
                    [
                        "title" => "Express Delivery",
                        "description" => "90 min express delivery"
                    ],
                    [
                        "title" => "Morning",
                        "description" => "8.00 AM - 11.00 AM"
                    ],
                    [
                        "title" => "Noon",
                        "description" => "11.00 AM - 2.00 PM"
                    ],
                    [
                        "title" => "Afternoon",
                        "description" => "2.00 PM - 5.00 PM"
                    ],
                    [
                        "title" => "Evening",
                        "description" => "5.00 PM - 8.00 PM"
                    ]
                ],
                "freeShipping" => false,
                "signupPoints" => 100,
                "siteSubtitle" => "Your next ecommerce",
                "useGoogleMap" => false,
                "shippingClass" => "1",
                "contactDetails" => [
                    "contact" => "+129290122122",
                    "socials" => [
                        [
                            "url" => "https://www.facebook.com/redqinc",
                            "icon" => "FacebookIcon"
                        ],
                        [
                            "url" => "https://twitter.com/RedqTeam",
                            "icon" => "TwitterIcon"
                        ],
                        [
                            "url" => "https://www.instagram.com/redqteam",
                            "icon" => "InstagramIcon"
                        ]
                    ],
                    "website" => "https://redq.io",
                    "emailAddress" => "demo@demo.com",
                    "location" => [
                        "lat" => 42.9585979,
                        "lng" => -76.9087202,
                        "zip" => null,
                        "city" => null,
                        "state" => "NY",
                        "country" => "United States",
                        "formattedAddress" => "NY State Thruway, New York, USA"
                    ]
                ],
                "paymentGateway" => [
                    [
                        "name" => "stripe",
                        "title" => "Stripe"
                    ]
                ],
                "currencyOptions" => [
                    "formation" => "en-US",
                    "fractions" => 2
                ],
                "enableCoupons" => false,
                "isMultiCommissionRate" => false,
                "enableReviewPopup" => false,
                "isProductReview" => false,
                "useEnableGateway" => false,
                "useCashOnDelivery" => true,
                "freeShippingAmount" => 0,
                "minimumOrderAmount" => 0,
                "useMustVerifyEmail" => false,
                "maximumQuestionLimit" => 5,
                "currencyToWalletRatio" => 3,
                "enableEmailForDigitalProduct" => false,
                "StripeCardOnly" => false,
                "guestCheckout" => true,
                "server_info" => server_environment_info(),
                "useAi"         => false,
                "defaultAi" => "openai",
                "maxShopDistance" => 1000,
                "siteLink" =>  "https://pickbazar.redq.io",
                "copyrightText" =>  "Copyright © REDQ. All rights reserved worldwide.",
                "externalText" =>  "REDQ",
                "externalLink" =>  "https://redq.io",
                "reviewSystem" => [
                    "value" => "review_single_time",
                    "name" => "Give purchased product a review only for one time. (By default)"
                ],
                ...$this->getSmsEmailEvents(),
                ...$this->maintenanceSettings(),
                ...$this->promoPopupSettings(),
            ]),
            "language" => DEFAULT_LANGUAGE ?? "en",
            "created_at" => Carbon::now(),
            "updated_at" => Carbon::now(),
        ]);
    }

    /**
     * The function returns an array of SMS and email events with their corresponding recipients and
     * event types.
     *
     * @return array An array containing events for SMS and email notifications for different user
     * roles (admin, vendor, and customer) related to order status changes, refunds, payments, creating
     * questions, creating reviews, and answering questions.
     */
    private function getSmsEmailEvents(): array
    {
        return [
            "smsEvent" => [
                "admin" => [
                    "statusChangeOrder" => false,
                    "refundOrder" => false,
                    "paymentOrder" => false
                ],
                "vendor" => [
                    "statusChangeOrder" => false,
                    "paymentOrder" => false,
                    "refundOrder" => false
                ],
                "customer" => [
                    "statusChangeOrder" => false,
                    "refundOrder" => false,
                    "paymentOrder" => false
                ]
            ],
            "emailEvent" => [
                "admin" => [
                    "statusChangeOrder" => false,
                    "refundOrder" => false,
                    "paymentOrder" => false
                ],
                "vendor" => [
                    "createQuestion" => false,
                    "statusChangeOrder" => false,
                    "refundOrder" => false,
                    "paymentOrder" => false,
                    "createReview" => false
                ],
                "customer" => [
                    "statusChangeOrder" => false,
                    "refundOrder" => false,
                    "paymentOrder" => false,
                    "answerQuestion" => false
                ]
            ],
            "pushNotification" => [
                "all" => [
                    "order" => false,
                    "message" => false,
                    "storeNotice" => false
                ],
            ],
        ];
    }
    private function maintenanceSettings(): array
    {
        return [
            "isUnderMaintenance" => false,
            "maintenance" => [
                "title"                 => "Site is under Maintenance",
                "buttonTitleOne"        => "Notify Me",
                "newsLetterTitle"       => "Subscribe Newsletter",
                "buttonTitleTwo"        => "Contact Us",
                "contactUsTitle"        => "Contact Us",
                "aboutUsTitle"          => "About Us",
                "isOverlayColor"        => false,
                "overlayColor"          => null,
                "overlayColorRange"     => null,
                "description"           => "We are currently undergoing essential maintenance to elevate your browsing experience. Our team is working diligently to implement improvements that will bring you an even more seamless and enjoyable interaction with our site. During this period, you may experience temporary inconveniences. We appreciate your patience and understanding. Thank you for being a part of our community, and we look forward to unveiling the enhanced features and content soon.",
                "newsLetterDescription" => "Stay in the loop! Subscribe to our newsletter for exclusive deals and the latest trends delivered straight to your inbox. Elevate your shopping experience with insider access.",
                "aboutUsDescription"    => "Welcome to Pickbazar, your go-to destination for curated excellence. Discover a fusion of style, quality, and affordability in every click. Join our community and elevate your shopping experience with us!",
                "image" => [
                    'id'        => 1794,
                    'file_name' => "background.png",
                    'original'  => "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/1792/background.png",
                    'thumbnail' => "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/1792/conversions/background-thumbnail.jpg",
                ],
                "start"       => Carbon::now(),
                "until"       => Carbon::now()->addDays(1),
            ],
        ];
    }
    private function promoPopupSettings(): array
    {
        return [
            "isPromoPopUp" => true,
            "promoPopup" => [
                "image" => [
                    "id" => 1793,
                    "original" => "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/1791/pickbazar02.png",
                    "file_name" => "pickbazar02.png",
                    "thumbnail" => "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/1791/conversions/pickbazar02-thumbnail.jpg"
                ],
                "title" => "Get 25% Discount",
                "popUpDelay" => 5000,
                "description" => "Subscribe to the mailing list to receive updates on new arrivals, special offers and our promotions.",
                "popUpNotShow" => [
                    "title" => "Don't show this popup again",
                    "popUpExpiredIn" => 7
                ],
                "isPopUpNotShow" => true,
                "popUpExpiredIn" => 1
            ],
        ];
    }
}
