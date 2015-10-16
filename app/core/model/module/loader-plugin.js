interface LoaderPlugin {
  fetch(address: string): Promise<any>;
}