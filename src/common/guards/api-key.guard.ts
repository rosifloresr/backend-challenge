import { CanActivate,ExecutionContext, Injectable, UnauthorizedException,} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key missing');
    }

    if (apiKey !== this.configService.get<string>('API_KEY')) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
