import route3k from './3k.json';
import route7k from './7k.json';
import route12k from './12k.json';
import { TrailrunRoute } from '@/lib/types';

export const trailrunRoutes: Record<string, TrailrunRoute> = {
  '3k': route3k as unknown as TrailrunRoute,
  '7k': route7k as unknown as TrailrunRoute,
  '12k': route12k as unknown as TrailrunRoute,
};

export { route3k, route7k, route12k };
