/**
 * CustomTokenSimulationModule - BPMN Token Simulation Integration Module
 *
 * Encapsulates bpmn-js-token-simulation for seamless integration with CustomModeler.
 * Provides token simulation capabilities with full TypeScript support.
 */

import TokenSimulationModule from 'bpmn-js-token-simulation';
import SimulationSupportModule from 'bpmn-js-token-simulation/lib/simulation-support';

/**
 * Token Simulation Module Configuration
 */
export interface TokenSimulationConfig {
  /** Whether to enable simulation mode by default */
  enabled?: boolean;
  /** Simulation animation speed (0.1 - 10) */
  animationSpeed?: number;
  /** Whether to show simulation state indicators */
  showStateIndicators?: boolean;
  /** Whether to enable simulation logging */
  enableLogging?: boolean;
}

/**
 * Default configuration for token simulation
 */
const DEFAULT_TOKEN_SIMULATION_CONFIG: Required<TokenSimulationConfig> = {
  enabled: false,
  animationSpeed: 1.0,
  showStateIndicators: true,
  enableLogging: false,
};

/**
 * Custom Token Simulation Module
 *
 * Integrates bpmn-js-token-simulation with enhanced configuration options.
 */
const CustomTokenSimulationModule = {
  __depends__: [
    TokenSimulationModule,
    SimulationSupportModule
  ],

  __init__: [
    // Module initialization if needed
  ]
};

/**
 * Create configured token simulation module
 *
 * @param config Token simulation configuration
 * @returns Configured module for bpmn-js
 */
export function createTokenSimulationModule(config: TokenSimulationConfig = {}) {
  const mergedConfig = { ...DEFAULT_TOKEN_SIMULATION_CONFIG, ...config };

  return {
    ...CustomTokenSimulationModule,
    // Add configuration as module metadata
    __config__: mergedConfig
  };
}

/**
 * Default token simulation module with standard configuration
 */
const defaultTokenSimulationModule = createTokenSimulationModule();

export default defaultTokenSimulationModule;

/**
 * Token simulation module with modeler-specific configuration
 * Includes editing capabilities alongside simulation
 */
export const tokenSimulationModelerModule = createTokenSimulationModule({
  enabled: true,
  animationSpeed: 1.0,
  showStateIndicators: true,
  enableLogging: true,
});

/**
 * Token simulation module for viewer mode
 * Optimized for simulation-only scenarios
 */
export const tokenSimulationViewerModule = createTokenSimulationModule({
  enabled: true,
  animationSpeed: 1.2,
  showStateIndicators: true,
  enableLogging: false,
});
