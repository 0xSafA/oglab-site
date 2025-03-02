<?php

namespace oglab\Payments;

use oglab\Database\Models\Settings;

abstract class Base
{
  public $currency;

  public function __construct()
  {
    $settings = Settings::first();
    $this->currency = $settings->options['currency'];
  }
}
