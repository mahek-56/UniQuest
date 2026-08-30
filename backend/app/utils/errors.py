"""
Standard error response helpers and exception handlers for FastAPI.
"""

from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def not_found(resource: str = "Resource") -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} not found")


def forbidden(detail: str = "Insufficient permissions") -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def conflict(detail: str = "Resource already exists") -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    # Convert errors to JSON-serializable format (ctx may contain Exception objects)
    errors = []
    for error in exc.errors():
        err = dict(error)
        if "ctx" in err and isinstance(err["ctx"], dict):
            err["ctx"] = {
                k: str(v) if isinstance(v, Exception) else v
                for k, v in err["ctx"].items()
            }
        errors.append(err)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": errors},
    )


async def http_exception_handler(
    request: Request,
    exc: HTTPException,
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
