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

namespace FoF\Sentry\Reporters;

use Flarum\Foundation\ErrorHandling\Reporter;
use Flarum\Http\RequestUtil;
use Illuminate\Contracts\Container\Container;
use Psr\Log\LoggerInterface;
use Sentry\State\HubInterface;
use Sentry\State\Scope;
use Throwable;

class SentryReporter implements Reporter
{
    /** @var LoggerInterface */
    protected $logger;

    /** @var Container */
    private $container;

    public function __construct(LoggerInterface $logger, Container $container)
    {
        $this->logger = $logger;
        $this->container = $container;
    }

    public function report(Throwable $error): void
    {
        /** @var HubInterface $hub */
        $hub = $this->container->make('sentry');
        if ($hub === null) {
            return;
        }

        if ($this->container->bound('sentry.request')) {
            $hub->configureScope(function (Scope $scope) {
                $request = $this->container->make('sentry.request');
                $user = RequestUtil::getActor($request);

                if ($user->id !== 0 && !$user->isGuest()) {
                    $data = $user->only('id', 'username');

                    // Only send email if enabled in settings
                    if (resolve('flarum.settings')->get('fof-sentry.send_emails_with_sentry_reports')) {
                        $data['email'] = $user->email;
                    }

                    $scope->setUser($data);
                }
            });
        }

        if ($hub->captureException($error) === null) {
            $this->logger->warning('[fof/sentry] exception of type '.get_class($error).' failed to send');
        }
    }
}
