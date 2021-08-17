import { AppState } from '../App';
import Artifact from '../js/artifact/Artifact';
import ArtifactSet from '../js/artifact/ArtifactSet';
import { ArtifactType, InputStat } from '../js/artifact/types';
import Character from '../js/character/Character';
import CritType from '../js/modifier/CritType';
import { getOptionValue, setOptionValue } from '../js/option';
import Resistance from '../js/Resistance';
import { Element } from '../js/talent/types';
import Weapon from '../js/weapon/Weapon';

export default interface Save {
  label: string;

  characterId?: string;
  characterLevel?: number;
  characterHasAscended?: boolean;

  weaponId?: string;
  weaponLevel?: number;
  weaponHasAscended?: boolean;

  artifacts?: ArtifactSave[];

  artifactSets?: { artifactSetId?: string; artifactSetPieces?: number }[];

  talentAttackLevel?: number;
  talentSkillLevel?: number;
  talentBurstLevel?: number;

  critType?: CritType;
  enemyLevel?: number;
  enemyRes?: {
    anemo?: number;
    cryo?: number;
    electro?: number;
    geo?: number;
    hydro?: number;
    pyro?: number;
    physical?: number;
  };

  characterOptions?: { id?: string; value?: unknown }[];
  artifactSetOptions?: { id?: string; value?: unknown }[];
}

export type Saves = Record<string, Save>;

interface ArtifactSave {
  type?: ArtifactType;
  mainStat?: InputStatSave;
  subStats?: InputStatSave[];
}

interface InputStatSave {
  stat?: string;
  value?: number;
  rawValue?: number;
}

function createInputStatSave({
  stat,
  value,
  rawValue,
}: InputStat): InputStatSave {
  return { stat, value, rawValue };
}

export function createSave(label: string, appState: AppState): Save {
  const save: Save = {
    label,

    characterId: appState.character.id,
    characterLevel: appState.character.level,
    characterHasAscended: appState.character.hasAscended,

    weaponId: appState.weapon.id,
    weaponLevel: appState.weapon.weaponLevel,
    weaponHasAscended: appState.weapon.hasAscended,

    artifacts: appState.artifacts.map((artifact) => {
      return {
        type: artifact.type,
        mainStat: createInputStatSave(artifact.mainStat),
        subStats: artifact.subStats.map((subStat) =>
          createInputStatSave(subStat)
        ),
      };
    }),

    artifactSets: appState.artifactSets.map((artifactSet) => {
      return {
        artifactSetId: artifactSet.id,
        artifactSetPieces: artifactSet.pieces,
      };
    }),

    talentAttackLevel: appState.talentAttackLevel,
    talentSkillLevel: appState.talentSkillLevel,
    talentBurstLevel: appState.talentBurstLevel,

    critType: appState.critType,
    enemyLevel: appState.enemyLevel,
    enemyRes: {
      anemo: appState.enemyRes.get(Element.Anemo),
      cryo: appState.enemyRes.get(Element.Cryo),
      electro: appState.enemyRes.get(Element.Electro),
      geo: appState.enemyRes.get(Element.Geo),
      hydro: appState.enemyRes.get(Element.Hydro),
      pyro: appState.enemyRes.get(Element.Pyro),
      physical: appState.enemyRes.get(Element.Physical),
    },

    characterOptions: appState.characterOptions.map((option) => {
      return { id: option.id, value: getOptionValue(option) };
    }),
    artifactSetOptions: appState.artifactSetOptions.map((option) => {
      return { id: option.id, value: getOptionValue(option) };
    }),
  };

  return save;
}

export function loadSave(
  save: Save,
  setAppState: <K extends keyof AppState>(
    state: Pick<AppState, K>,
    callback?: () => void
  ) => void,
  refreshApp: () => void
) {
  const character = new Character(
    save.characterId ?? '',
    save.characterLevel ?? 1,
    save.characterHasAscended ?? false
  );
  const weapon = new Weapon(
    save.weaponId ?? '',
    save.weaponLevel ?? 1,
    save.weaponHasAscended ?? false
  );

  const artifacts =
    save.artifacts?.map((savedArtifact, i) => {
      const artifactType = savedArtifact.type ?? Object.values(ArtifactType)[i];
      let artifact = new Artifact(artifactType);
      artifact.mainStat = new InputStat(
        savedArtifact.mainStat?.stat ?? '',
        savedArtifact.mainStat?.value ?? NaN,
        savedArtifact.mainStat?.rawValue ?? NaN
      );
      artifact.subStats =
        savedArtifact.subStats?.map(
          (subStat) =>
            new InputStat(
              subStat.stat ?? '',
              subStat.value ?? NaN,
              subStat.rawValue ?? NaN
            )
        ) ?? artifact.subStats;

      return artifact;
    }) ?? Object.values(ArtifactType).map((type) => new Artifact(type));

  const artifactSets = save.artifactSets?.map(
    (artifactSet) =>
      new ArtifactSet(
        artifactSet.artifactSetId ?? '',
        artifactSet.artifactSetPieces ?? 0
      )
  ) ?? [new ArtifactSet(''), new ArtifactSet(''), new ArtifactSet('')];

  const talentAttackLevel = save.talentAttackLevel ?? 1;
  const talentSkillLevel = save.talentSkillLevel ?? 1;
  const talentBurstLevel = save.talentBurstLevel ?? 1;

  const critType = save.critType ?? CritType.None;
  const enemyLevel = save.enemyLevel ?? 1;
  const enemyRes = save.enemyRes
    ? new Resistance(save.enemyRes)
    : new Resistance();

  const characterOptions = character.getOptions();
  save.characterOptions?.forEach((option) => {
    let characterOption = characterOptions.find(
      (characterOption) => characterOption.id === option.id
    );
    if (characterOption !== undefined) {
      setOptionValue(characterOption, option.value);
    }
  });

  const artifactSetOptions = artifactSets.flatMap(
    (artifactSet) => artifactSet.options
  );
  save.artifactSetOptions?.forEach((option) => {
    let artifactSetOption = artifactSetOptions.find(
      (artifactSetOption) => artifactSetOption.id === option.id
    );
    if (artifactSetOption !== undefined) {
      setOptionValue(artifactSetOption, option.value);
    }
  });

  setAppState(
    {
      character,
      weapon,
      artifacts,
      artifactSets,
      talentAttackLevel,
      talentSkillLevel,
      talentBurstLevel,
      critType,
      enemyLevel,
      enemyRes,
      characterOptions,
      artifactSetOptions,
    },

    // Update stats and talents
    refreshApp
  );
}

export function addSave(save: Save, saves: Saves) {
  saves[save.label] = save;
  window.localStorage.setItem('saves', JSON.stringify(saves));
}

export function getSave(label: string, saves: Saves): Save | undefined {
  return saves[label];
}
