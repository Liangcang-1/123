import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'crypto';

const HINT_MAP: Record<string, string> = {
  INPUT_INVALID: '请检查输入参数是否完整且格式正确。',
  ASSET_TOO_LARGE: '请压缩素材后重试，建议小于 10MB。',
  ENGINE_TIMEOUT: '计算超时，请稍后重试或减少输入复杂度。',
  NOT_ENTITLED: '当前套餐暂未开通该工具，可升级后继续。',
};

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const traceId = randomUUID();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse() as any;
      const code = payload?.code || 'HTTP_ERROR';
      response.status(status).json({ ok: false, error: { code, message: payload?.message || exception.message, traceId, hint: HINT_MAP[code] || '请稍后重试。' } });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: '服务暂时不可用', traceId, hint: '请稍后重试。' },
    });
  }
}
