import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()
        response = await call_next(request)
        elapsed = (time.time() - start_time) * 1000

        response.headers['X-Response-Time'] = f"{elapsed:.2f}ms"
        response.headers['X-Request-ID'] = request.headers.get('X-Request-ID', 'unknown')

        logger.info(
            f"{request.method} {request.url.path} - {response.status_code} - {elapsed:.0f}ms"
        )

        return response


async def request_logging_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    elapsed = time.time() - start

    logger.info(
        f"{request.method} {request.url} - {response.status_code} - {elapsed:.3f}s"
    )
    return response