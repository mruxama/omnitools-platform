export type UnitCategory =
  | "length"
  | "weight"
  | "temperature"
  | "area"
  | "volume"
  | "speed"
  | "time"
  | "digital"
  | "energy"
  | "pressure";

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

export interface UnitCategoryData {
  id: UnitCategory;
  name: string;
  baseUnit: string;
  units: Record<string, UnitDefinition>;
}

export const UNIT_CATEGORIES: Record<UnitCategory, UnitCategoryData> = {
  length: {
    id: "length",
    name: "Length",
    baseUnit: "meter",
    units: {
      meter: { id: "meter", name: "Meter", symbol: "m", toBase: (v) => v, fromBase: (v) => v },
      kilometer: { id: "kilometer", name: "Kilometer", symbol: "km", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      centimeter: { id: "centimeter", name: "Centimeter", symbol: "cm", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      millimeter: { id: "millimeter", name: "Millimeter", symbol: "mm", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      mile: { id: "mile", name: "Mile", symbol: "mi", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      yard: { id: "yard", name: "Yard", symbol: "yd", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      foot: { id: "foot", name: "Foot", symbol: "ft", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      inch: { id: "inch", name: "Inch", symbol: "in", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      nautical_mile: { id: "nautical_mile", name: "Nautical Mile", symbol: "NM", toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
    },
  },
  weight: {
    id: "weight",
    name: "Weight & Mass",
    baseUnit: "kilogram",
    units: {
      kilogram: { id: "kilogram", name: "Kilogram", symbol: "kg", toBase: (v) => v, fromBase: (v) => v },
      gram: { id: "gram", name: "Gram", symbol: "g", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      milligram: { id: "milligram", name: "Milligram", symbol: "mg", toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
      metric_ton: { id: "metric_ton", name: "Metric Ton", symbol: "t", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      pound: { id: "pound", name: "Pound", symbol: "lb", toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      ounce: { id: "ounce", name: "Ounce", symbol: "oz", toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 },
      stone: { id: "stone", name: "Stone", symbol: "st", toBase: (v) => v * 6.35029318, fromBase: (v) => v / 6.35029318 },
    },
  },
  temperature: {
    id: "temperature",
    name: "Temperature",
    baseUnit: "celsius",
    units: {
      celsius: { id: "celsius", name: "Celsius", symbol: "°C", toBase: (v) => v, fromBase: (v) => v },
      fahrenheit: {
        id: "fahrenheit",
        name: "Fahrenheit",
        symbol: "°F",
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      kelvin: {
        id: "kelvin",
        name: "Kelvin",
        symbol: "K",
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    },
  },
  area: {
    id: "area",
    name: "Area",
    baseUnit: "square_meter",
    units: {
      square_meter: { id: "square_meter", name: "Square Meter", symbol: "m²", toBase: (v) => v, fromBase: (v) => v },
      square_kilometer: { id: "square_kilometer", name: "Square Kilometer", symbol: "km²", toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
      square_foot: { id: "square_foot", name: "Square Foot", symbol: "ft²", toBase: (v) => v * 0.09290304, fromBase: (v) => v / 0.09290304 },
      square_mile: { id: "square_mile", name: "Square Mile", symbol: "mi²", toBase: (v) => v * 2589988.11, fromBase: (v) => v / 2589988.11 },
      acre: { id: "acre", name: "Acre", symbol: "ac", toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224 },
      hectare: { id: "hectare", name: "Hectare", symbol: "ha", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    },
  },
  volume: {
    id: "volume",
    name: "Volume",
    baseUnit: "liter",
    units: {
      liter: { id: "liter", name: "Liter", symbol: "L", toBase: (v) => v, fromBase: (v) => v },
      milliliter: { id: "milliliter", name: "Milliliter", symbol: "mL", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      cubic_meter: { id: "cubic_meter", name: "Cubic Meter", symbol: "m³", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      gallon_us: { id: "gallon_us", name: "US Gallon", symbol: "gal", toBase: (v) => v * 3.785411784, fromBase: (v) => v / 3.785411784 },
      quart_us: { id: "quart_us", name: "US Quart", symbol: "qt", toBase: (v) => v * 0.946352946, fromBase: (v) => v / 0.946352946 },
      pint_us: { id: "pint_us", name: "US Pint", symbol: "pt", toBase: (v) => v * 0.473176473, fromBase: (v) => v / 0.473176473 },
      cup_us: { id: "cup_us", name: "US Cup", symbol: "cup", toBase: (v) => v * 0.24, fromBase: (v) => v / 0.24 },
      fluid_ounce_us: { id: "fluid_ounce_us", name: "US Fluid Ounce", symbol: "fl oz", toBase: (v) => v * 0.0295735295625, fromBase: (v) => v / 0.0295735295625 },
    },
  },
  speed: {
    id: "speed",
    name: "Speed",
    baseUnit: "mps",
    units: {
      mps: { id: "mps", name: "Meters per second", symbol: "m/s", toBase: (v) => v, fromBase: (v) => v },
      kph: { id: "kph", name: "Kilometers per hour", symbol: "km/h", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      mph: { id: "mph", name: "Miles per hour", symbol: "mph", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      knot: { id: "knot", name: "Knot", symbol: "kn", toBase: (v) => v * 0.514444444, fromBase: (v) => v / 0.514444444 },
      fps: { id: "fps", name: "Feet per second", symbol: "ft/s", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    },
  },
  time: {
    id: "time",
    name: "Time",
    baseUnit: "second",
    units: {
      second: { id: "second", name: "Second", symbol: "s", toBase: (v) => v, fromBase: (v) => v },
      millisecond: { id: "millisecond", name: "Millisecond", symbol: "ms", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      minute: { id: "minute", name: "Minute", symbol: "min", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      hour: { id: "hour", name: "Hour", symbol: "hr", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      day: { id: "day", name: "Day", symbol: "d", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      week: { id: "week", name: "Week", symbol: "wk", toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
      year: { id: "year", name: "Year (365 days)", symbol: "yr", toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
    },
  },
  digital: {
    id: "digital",
    name: "Digital Storage",
    baseUnit: "byte",
    units: {
      byte: { id: "byte", name: "Byte", symbol: "B", toBase: (v) => v, fromBase: (v) => v },
      kilobyte: { id: "kilobyte", name: "Kilobyte (Decimal)", symbol: "KB", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      megabyte: { id: "megabyte", name: "Megabyte (Decimal)", symbol: "MB", toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
      gigabyte: { id: "gigabyte", name: "Gigabyte (Decimal)", symbol: "GB", toBase: (v) => v * 1000000000, fromBase: (v) => v / 1000000000 },
      terabyte: { id: "terabyte", name: "Terabyte (Decimal)", symbol: "TB", toBase: (v) => v * 1000000000000, fromBase: (v) => v / 1000000000000 },
      kibibyte: { id: "kibibyte", name: "Kibibyte (Binary)", symbol: "KiB", toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      mebibyte: { id: "mebibyte", name: "Mebibyte (Binary)", symbol: "MiB", toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
      gibibyte: { id: "gibibyte", name: "Gibibyte (Binary)", symbol: "GiB", toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
    },
  },
  energy: {
    id: "energy",
    name: "Energy",
    baseUnit: "joule",
    units: {
      joule: { id: "joule", name: "Joule", symbol: "J", toBase: (v) => v, fromBase: (v) => v },
      kilojoule: { id: "kilojoule", name: "Kilojoule", symbol: "kJ", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      calorie: { id: "calorie", name: "Gram Calorie", symbol: "cal", toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
      kilocalorie: { id: "kilocalorie", name: "Kilocalorie (Food Calorie)", symbol: "kcal", toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
      watt_hour: { id: "watt_hour", name: "Watt-hour", symbol: "Wh", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      kilowatt_hour: { id: "kilowatt_hour", name: "Kilowatt-hour", symbol: "kWh", toBase: (v) => v * 3600000, fromBase: (v) => v / 3600000 },
      btu: { id: "btu", name: "British Thermal Unit", symbol: "BTU", toBase: (v) => v * 1055.05585, fromBase: (v) => v / 1055.05585 },
    },
  },
  pressure: {
    id: "pressure",
    name: "Pressure",
    baseUnit: "pascal",
    units: {
      pascal: { id: "pascal", name: "Pascal", symbol: "Pa", toBase: (v) => v, fromBase: (v) => v },
      kilopascal: { id: "kilopascal", name: "Kilopascal", symbol: "kPa", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      bar: { id: "bar", name: "Bar", symbol: "bar", toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
      psi: { id: "psi", name: "Pounds per Square Inch", symbol: "psi", toBase: (v) => v * 6894.75729, fromBase: (v) => v / 6894.75729 },
      atmosphere: { id: "atmosphere", name: "Standard Atmosphere", symbol: "atm", toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
      torr: { id: "torr", name: "Torr / mmHg", symbol: "Torr", toBase: (v) => v * 133.322368, fromBase: (v) => v / 133.322368 },
    },
  },
};

export function convertUnits(
  category: UnitCategory,
  value: number,
  fromUnitId: string,
  toUnitId: string
): number {
  const cat = UNIT_CATEGORIES[category];
  if (!cat) throw new Error(`Unknown unit category: ${category}`);

  const fromUnit = cat.units[fromUnitId];
  const toUnit = cat.units[toUnitId];

  if (!fromUnit || !toUnit) {
    throw new Error(`Unit ${fromUnitId} or ${toUnitId} not found in ${category}`);
  }

  const baseVal = fromUnit.toBase(value);
  return toUnit.fromBase(baseVal);
}
