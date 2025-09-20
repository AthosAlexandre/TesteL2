import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    if (process.env.ENABLE_API_KEY !== 'true') return true;
    const req = ctx.switchToHttp().getRequest();
    const key = req.headers['x-api-key'];
    return key && key === process.env.API_KEY;
  }
}
