import { Talents } from '../../talent/types';
import Character from '../Character';
import tartagliaTalents from './TartagliaTalent';

export default class Tartaglia extends Character {
  constructor(
    _id: string,
    level?: number,
    hasAscended?: boolean,
    constellationLevel?: number
  ) {
    super('tartaglia', level, hasAscended, constellationLevel);
  }

  getTalentFns(): Talents {
    return tartagliaTalents;
  }
}
