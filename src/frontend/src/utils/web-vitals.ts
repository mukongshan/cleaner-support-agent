import { onCLS, onFID, onINP, onLCP, onFCP } from 'web-vitals';

type Metric =
  | 'CLS'
  | 'FID'
  | 'INP'
  | 'LCP'
  | 'FCP';

type ReportHandler = (metric: {
  name: Metric;
  value: number;
  id: string;
}) => void;

/**
 * 注入 Web Vitals 上报逻辑。
 * - 生产环境可接入真实监控平台（如埋点 SDK）
 * - 开发/测试环境默认打印到控制台，便于调试
 */
export function initWebVitals(report?: ReportHandler) {
  const handler: ReportHandler =
    report ||
    ((metric) => {
      // 仅在开发/测试环境打印，生产环境建议替换为实际上报
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[WebVitals]', metric.name, {
          value: metric.value,
          id: metric.id,
        });
      }
    });

  onCLS((m) => handler({ name: 'CLS', value: m.value, id: m.id }));
  onFID((m) => handler({ name: 'FID', value: m.value, id: m.id }));
  onINP((m) => handler({ name: 'INP', value: m.value, id: m.id }));
  onLCP((m) => handler({ name: 'LCP', value: m.value, id: m.id }));
  onFCP((m) => handler({ name: 'FCP', value: m.value, id: m.id }));
}

