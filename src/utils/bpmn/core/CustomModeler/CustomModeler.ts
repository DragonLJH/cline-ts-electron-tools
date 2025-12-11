
/**
 * CustomModeler - Enhanced BPMN 2.0 Process Designer Component
 *
 * Extends the bpmn-js Modeler class with complete TypeScript support.
 */
import Modeler from 'bpmn-js/lib/Modeler';
import { initialDiagram } from '../xmlStr';
import { CustomLoggerService } from '../../modules/CustomLoggerService/CustomLoggerService';
import { BpmnError, validateContainer, validateXml, withErrorHandling } from '../../utils/errors';
import { getCurrentTheme } from '../../styles';

/**
 * CustomModeler constructor options interface
 */
export interface CustomModelerOptions {
  /** BPMN XML string for initializing the diagram */
  xml?: string;
  /** HTML element or selector containing the Modeler */
  container?: HTMLElement | string;
  /** Properties panel parent element */
  propertiesPanel?: {
    parent?: HTMLElement | string;
  };
  /** Theme configuration */
  theme?: string;
  /** Additional modules to load */
  additionalModules?: any[];
  /** Other bpmn-js Modeler options */
  [key: string]: any;
}

/**
 * Import result interface
 */
export interface ImportResult {
  warnings: string[];
}

/**
 * Export result interface
 */
export interface ExportResult {
  xml?: string;
  svg?: string;
  warnings?: string[];
}

/**
 * BPMN Modeler Class with TypeScript Support
 *
 * Provides enhanced BPMN diagram editing capabilities with full type safety.
 */
export default class CustomModeler extends Modeler {
  /** Whether the modeler is initialized */
  private _initialized: boolean = false;

  /** Current XML content */
  private _currentXML: string = '';

  /** Current file name */
  private _currentFileName: string = 'untitled.bpmn';

  /** Initialization options */
  private _options: CustomModelerOptions;

  /** Logger instance */
  private static _logger: CustomLoggerService = new CustomLoggerService();

  /**
   * Constructor
   *
   * @param options Initialization options including XML and container
   * @throws {Error} When required parameters are invalid
   */
  constructor({ xml, ...options }: CustomModelerOptions = {}) {
    super(options);
    this._options = { xml, ...options };

    // Validate container if provided
    if (options.container) {
      this._validateContainer(options.container);
    }

    // Async initialization
    this._initialize(xml);
  }

  /**
   * Validate container element
   * @private
   */
  private _validateContainer(container: HTMLElement | string): void {
    validateContainer(container);
  }

  /**
   * Initialize the modeler
   * @private
   */
  private async _initialize(xml?: string): Promise<void> {
    try {
      const xmlToImport = xml ?? initialDiagram;
      await this.importXML(xmlToImport);
      this._initialized = true;
      this._currentXML = xmlToImport;
    } catch (error) {
      CustomModeler._logger.error('Failed to initialize CustomModeler', error);
      throw error;
    }
  }

  /**
   * Import BPMN XML
   *
   * @param xml BPMN XML string
   * @returns Promise resolving to import result
   * @throws {BpmnError} When XML is invalid or import fails
   */
  importXML(xml: string): Promise<ImportResult> {
    validateXml(xml);

    return withErrorHandling(
      async () => {
        this._currentXML = xml;
        return await super.importXML(xml);
      },
      (error) => BpmnError.importFailed({ originalError: error })
    );
  }

  /**
   * Export BPMN XML
   *
   * @param options Export options
   * @returns Promise resolving to export result
   */
  saveXML(options: { format?: boolean } = {}): Promise<ExportResult> {
    return super.saveXML(options).then(result => {
      if (result.xml) {
        this._currentXML = result.xml;
      }
      return result as ExportResult;
    });
  }

  /**
   * Export SVG
   *
   * @returns Promise resolving to SVG export result
   */
  saveSVG(): Promise<any> {
    return super.saveSVG();
  }

  /**
   * Get current status
   */
  getStatus(): {
    initialized: boolean;
    currentFileName: string;
    hasXML: boolean;
  } {
    return {
      initialized: this._initialized,
      currentFileName: this._currentFileName,
      hasXML: Boolean(this._currentXML)
    };
  }

  /**
   * Set current file name
   *
   * @param fileName File name
   */
  setCurrentFileName(fileName: string): void {
    if (typeof fileName !== 'string' || !fileName.trim()) {
      throw new Error('Invalid file name: must be a non-empty string');
    }
    this._currentFileName = fileName.trim();
  }

  /**
   * Get current file name
   */
  getCurrentFileName(): string {
    return this._currentFileName;
  }

  /**
   * Get current XML content
   */
  getCurrentXML(): string {
    return this._currentXML;
  }

  /**
   * Override toString for debugging
   */
  toString(): string {
    return `[CustomModeler file="${this._currentFileName}" initialized=${this._initialized}]`;
  }
}
