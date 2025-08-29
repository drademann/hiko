export type WallboxState = {
  connectionState: ConnectionState;
};

export enum ConnectionState {
  NoVehicleConnected,
  ConnectedNotLoading,
  ConnectedLoading,
  Unknown,
}
