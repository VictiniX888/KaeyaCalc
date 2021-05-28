import Option from '../Option';

export default class CharacterOption extends Option {
  constructor({
    id,
    type,
    initialValue,

    // Applies the Option onto stats
    // Mutates stats directly
    applyOnStats = (
      stats,
      value,
      { talentAttackLevel, talentSkillLevel, talentBurstLevel }
    ) => {
      return stats;
    },

    // Applies the Option onto modifier
    // Mutates modifier directly
    applyOnModifier = (modifier, value) => {
      return modifier;
    },
  }) {
    super({ id, type, initialValue, applyOnStats, applyOnModifier });
  }

  applyOnStats(stats, talentAttackLevel, talentSkillLevel, talentBurstLevel) {
    this._applyOnStats(stats, this.value, {
      talentAttackLevel,
      talentSkillLevel,
      talentBurstLevel,
    });
    return stats;
  }
}
