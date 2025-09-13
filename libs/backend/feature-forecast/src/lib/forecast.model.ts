export interface PowerValue {
  value: number;
  unit: string;
}

export interface Forecast {
  powerValues: PowerValue[];
}
