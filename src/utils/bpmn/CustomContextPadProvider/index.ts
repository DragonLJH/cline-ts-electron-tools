/**
 * Custom Context Pad Provider Module Export
 *
 * This module provides multiple implementation approaches for BPMN.js context pad providers.
 *
 * 🚀 Production Recommendation: Use StandaloneContextPadProvider
 * 🎓 Educational: See InheritanceExample for OOP patterns
 */

import StandaloneContextPadProvider, {
  ContextPadEntry,
  ContextPadEntries,
  ContextPadConfig,
  Element,
  BusinessOptions
} from './StandaloneProvider';

// 🎓 Educational inheritance example (not for production)
import InheritedContextPadProvider, { inheritanceModule } from './InheritanceExample';

// Export production-ready provider
export { StandaloneContextPadProvider };

// Export educational inheritance example
export { InheritedContextPadProvider };

// Export type definitions (shared between implementations)
export type {
  ContextPadEntry,
  ContextPadEntries,
  ContextPadConfig,
  Element,
  BusinessOptions
};

// Export modules for bpmn-js integration
export const contextPadProviderModule = {
  __init__: ['contextPadProvider'],
  __depends__: [],
  contextPadProvider: ['type', StandaloneContextPadProvider]
};

// Export educational module
export { inheritanceModule };

// Export as default for bpmn-js module system
export { StandaloneContextPadProvider as default };
export { StandaloneContextPadProvider as ContextPadProvider };

// Additional exports for testing/education
export { InheritedContextPadProvider as InheritanceExample };
