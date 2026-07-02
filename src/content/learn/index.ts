import { pythonFundamentals }     from "./python/fundamentals";
import { pythonAlgorithms }       from "./python/algorithms";
import { javascriptFundamentals } from "./javascript/fundamentals";
import { javascriptAlgorithms }   from "./javascript/algorithms";

export const learnContent: Record<string, Record<string, any[]>> = {
  python: {
    fundamentals: pythonFundamentals,
    algorithms:   pythonAlgorithms,
  },
  javascript: {
    fundamentals: javascriptFundamentals,
    algorithms:   javascriptAlgorithms,
  },
};
