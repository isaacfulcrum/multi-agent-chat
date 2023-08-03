/** definition for a generic service. A service is a class that has a well-defined
 * lifecycle. The lifecycle is:
 * - {@link #initialize()}
 * - [normal processing]
 * - {@link #shutdown()}  */
// ********************************************************************************
export interface IService {
    /** has {@link #initialize()} been called? */
    isInitializing(): boolean;
    /** is the service after {@link #initialize()} has been called but before {@link #shutdown()} */
    isInitialized(): boolean;
    /** initializes the Service */
    initialize(): Promise<void>;
    /** shuts down the Service */
    shutdown(): Promise<void>;
  }
 
  // ================================================================================
  /** a general implementation of {@link IService} */
  export abstract class AbstractService implements IService {
    protected initializing: boolean = false/*by default*/;
    protected initialized: boolean = false/*by default*/;
    public isInitializing() { return this.initializing; }
    public isInitialized() { return this.initialized; }
    
    // == Lifecycle =================================================================
    public constructor(protected readonly name: string) {/*nothing additional*/}
  
    /** initializes the Service */
    public async initialize() {
      if(this.initializing) { console.log(`${this.name} Service never initialized (or already shut down).`); return/*nothing to do*/; }
      this.initializing = true/*flag early to avoid recursion*/;
  
      await this.doInitialize();
  
      this.initialized = true; 
    }
  
    /** shuts down the Service */
    public async shutdown() {
      if(!this.initialized) { console.log(`${this.name} Service already shut down (or never initialized).`); return/*nothing to do*/; }
      this.initialized = false/*flag early to avoid recursion*/;
      await this.doShutdown();
      // NOTE: specifically not resetting #initializing since these Services are not designed to be re-initialized
    }
  
    // == Template Methods ==========================================================
    /** performs the initialization of the Service */
    protected async doInitialize(): Promise<void> {/*nothing by default*/}
  
    /** performs the shutdown of the Service */
    protected async doShutdown(): Promise<void> {/*nothing by default*/}
    
  }