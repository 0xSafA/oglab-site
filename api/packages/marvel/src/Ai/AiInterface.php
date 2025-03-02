<?php

namespace oglab\Ai;

interface AiInterface
{
  public function generateDescription(object $request): mixed;
}
