import { LCGImplementation } from "./lcg-implementation";

export interface LCGParameters {
  readonly MOD: number;
  readonly MULT: number;
  readonly INC: number;
}

const PARAMETERS = {
  // NOTE: These LCG parameters do not perform optimally on the spectral test
  // and should not be used for cryptographic applications.
  // Refer to Steele & Vigna 2020: https://arxiv.org/pdf/2001.05304.pdf

  // glibc 2.26 (2017)
  // https://sourceware.org/git/?p=glibc.git;a=blob;f=stdlib/random_r.c;hb=glibc-2.26#l362
  [LCGImplementation.GLIBC]: {
    MOD: 2147483648, // 32 bit
    MULT: 1103515245,
    INC: 12345,
  },

  // The Central Randomizer 1.3 (c) 1997 by Paul Houle (houle@msc.cornell.edu)
  [LCGImplementation.HOULE]: {
    MOD: 233280,
    MULT: 9301,
    INC: 49297,
  },

  // Java's java.util.Random
  [LCGImplementation.JAVA]: {
    MOD: 281474976710656, // 48 bit
    MULT: 25214903917,
    INC: 11,
  },
};

export const getParams = (implementation: LCGImplementation) => {
  return PARAMETERS[implementation];
};
