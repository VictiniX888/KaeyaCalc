import { getArtifactSetData, getArtifactSetBonusData } from '../Data';
import { artifactSetBonuses as extraBonuses } from './ArtifactSetBonus';
import { getArtifactSetOptions } from '../option';
import { ArtifactSetBonus, Stats } from '../../data/types';
import { ArtifactSetOption } from '../option/artifactSetOptions';

export default class ArtifactSet {
  constructor(id: string) {
    this.id = id;
  }

  private _id: string = '';
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    // Essentially replaces the constructor
    this._id = value;

    const data = getArtifactSetData(value);
    this.name = data?.name;
    this.bonusThresholds = data?.bonusThresholds;

    this.setBonuses = getArtifactSetBonusData(value);

    this.options = this.getOptions(this.pieces);
    this.stats = this.getStatsAt(this.pieces);
  }

  name?: string;
  bonusThresholds?: number[];
  setBonuses?: ArtifactSetBonus;

  private _pieces: number = 0;
  get pieces(): number {
    return this._pieces;
  }
  set pieces(value: number) {
    const prevPieces = this.pieces;
    this._pieces = value;
    this.options = this.getOptions(this.pieces, prevPieces);
    this.stats = this.getStatsAt(this.pieces);
  }

  options: ArtifactSetOption[] = [];
  stats: Stats = {};

  getSetBonusesAt(pieces: number) {
    return this.bonusThresholds
      ?.filter((threshold) => pieces >= threshold)
      .map((threshold) => this.setBonuses?.[threshold]);
  }

  getStatsAt(pieces: number) {
    let stats: Stats = {};

    let setBonuses = this.getSetBonusesAt(pieces);
    setBonuses?.forEach((setBonus) => {
      // Normal stat bonuses
      setBonus?.bonuses.forEach((statBonus) => {
        if (stats[statBonus.stat] !== undefined) {
          stats[statBonus.stat] += statBonus.value;
        } else {
          stats[statBonus.stat] = statBonus.value;
        }
      });

      // Special bonuses, has to be handled individually
      let extraBonus = setBonus?.bonusExtra;
      if (extraBonus !== undefined && extraBonus.type !== '') {
        let bonusFn =
          extraBonuses[extraBonus.type] ?? extraBonuses['defaultSetBonus'];

        let params = extraBonus.params;

        let statBonuses = bonusFn(params);

        statBonuses.forEach((statBonus) => {
          if (stats[statBonus.stat] !== undefined) {
            stats[statBonus.stat] += statBonus.value;
          } else {
            stats[statBonus.stat] = statBonus.value;
          }
        });
      }
    });

    return stats;
  }

  getOptions(pieces: number, prevPieces?: number) {
    if (prevPieces === undefined || isNaN(prevPieces)) {
      const options = getArtifactSetOptions(this.id);
      return options
        .map((Option) => new Option())
        .filter((option) => option.threshold <= pieces);
    } else if (pieces === prevPieces) {
      return this.options;
    } else if (pieces > prevPieces) {
      const newOptions = getArtifactSetOptions(this.id)
        .map((Option) => new Option())
        .filter(
          (option) =>
            option.threshold <= pieces && option.threshold > prevPieces
        );

      return this.options.concat(newOptions);
    } else {
      return this.options.filter((option) => option.threshold <= pieces);
    }
  }
}
