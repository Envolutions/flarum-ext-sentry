<?php

/*
 * This file is part of fof/sentry
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace FoF\Sentry\Performance\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface as Middleware;
use Psr\Http\Server\RequestHandlerInterface;
use Sentry\Tracing\Span;
use Sentry\Tracing\SpanContext;

class MeasurePerformanceMiddleware implements Middleware
{
    /** @var Span */
    protected $transaction;

    /** @var string */
    protected $frontend;

    public function __construct(string $frontend, Span $transaction)
    {
        $this->transaction = $transaction;
        $this->frontend = $frontend;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $span = $this->transaction->startChild(new SpanContext());
        $span->setOp("frontend.{$this->frontend}");

        $response = $handler->handle($request);

        $span->finish();

        return $response;
    }
}
