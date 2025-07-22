<?php

declare(strict_types=1);

/*
 * This file is part of fof/sentry
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace FoF\Sentry;

use Flarum\Extend;
use Flarum\Frontend\Document;
use Flarum\Frontend\RecompileFrontendAssets;
use Flarum\Locale\LocaleManager;
use Flarum\Settings\Event\Saved;
use FoF\Sentry\Middleware\HandleErrorsWithSentry;
use Illuminate\Container\Container;
use Illuminate\Support\Str;

return [
    (new Extend\ServiceProvider())
        ->register(SentryServiceProvider::class),

    (new Extend\Frontend('forum'))
        ->css(__DIR__.'/resources/less/forum.less')
        ->content(Content\SentryJavaScript::class),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->content(function (Document $document) {
            $document->payload['hasExcimer'] = extension_loaded('excimer');
        }),

    new Extend\Locales(__DIR__.'/resources/locale'),

    (new Extend\Middleware('forum'))
        ->add(HandleErrorsWithSentry::class),

    (new Extend\Middleware('admin'))
        ->add(HandleErrorsWithSentry::class),

    (new Extend\Middleware('api'))
        ->add(HandleErrorsWithSentry::class),

    (new Extend\Event())
        ->listen(Saved::class, function (Saved $event) {
            foreach ($event->settings as $key => $setting) {
                if (Str::startsWith($key, 'fof-sentry.javascript')) {
                    $container = Container::getInstance();
                    $recompile = new RecompileFrontendAssets(
                        $container->make('flarum.assets.forum'),
                        $container->make(LocaleManager::class)
                    );
                    $recompile->flush();

                    return;
                }
            }
        }),

    (new Extend\Settings())
        ->default('fof-sentry.monitor_performance', 0)
        ->default('fof-sentry.send_emails_with_sentry_reports', false)
        ->default('fof-sentry.user_feedback', false)
        ->default('fof-sentry.javascript.console', false)
        ->default('fof-sentry.javascript.trace_sample_rate', 0)
        ->default('fof-sentry.javascript.replays_session_sample_rate', 0)
        ->default('fof-sentry.javascript.replays_error_sample_rate', 0)
        ->default('fof-sentry.profile_rate', 0)
        ->default('fof-sentry.javascript', true),
];
