<?php

/*
 * This file is part of blazite/flarum-turnstile.
 *
 * Copyright (c) 2025 Blazite.
 * Copyright (c) 2022 Blomstra Ltd.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Blazite\Turnstile;

use Blazite\Turnstile\Listeners\AddValidatorRule;
use Blazite\Turnstile\Validator\TurnstileValidator;
use Flarum\Api\ForgotPasswordValidator;
use Flarum\Extend;
use Flarum\Forum\LogInValidator;
use Flarum\Frontend\Document;
use Flarum\User\Event\Saving as UserSaving;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->content(function (Document $document) {
            $document->head[] = '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"></script>';
        }),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Settings())
        ->default('blazite-turnstile.secret_key', null)
        ->default('blazite-turnstile.site_key', null)
        ->default('blazite-turnstile.signup', true)
        ->default('blazite-turnstile.signin', false)
        ->default('blazite-turnstile.forgot', true)
        ->serializeToForum('blazite-turnstile.site_key', 'blazite-turnstile.site_key')
        ->serializeToForum('turnstile_dark_mode', 'theme_dark_mode', 'boolVal')
        ->serializeToForum('blazite-turnstile.signup', 'blazite-turnstile.signup', 'boolVal')
        ->serializeToForum('blazite-turnstile.signin', 'blazite-turnstile.signin', 'boolVal')
        ->serializeToForum('blazite-turnstile.forgot', 'blazite-turnstile.forgot', 'boolVal'),

    (new Extend\Validator(TurnstileValidator::class))
        ->configure(AddValidatorRule::class),

    (new Extend\Validator(LogInValidator::class))
        ->configure(AddValidatorRule::class),

    (new Extend\Validator(ForgotPasswordValidator::class))
        ->configure(AddValidatorRule::class),

    (new Extend\Event())
        ->listen(UserSaving::class, Listeners\RegisterValidate::class),
];
