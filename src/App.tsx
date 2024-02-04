import "@mantine/core/styles.css";
import { Accordion, Anchor, AppShell, Button, Container, Fieldset, Group, NumberInput, MantineProvider, Modal, Select, Table, TextInput, getBreakpointValue, px } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { theme } from "./theme";
import { useState } from "react";

enum AttackType {
  Martial = 'Martial',
  Melee = 'Melee',
  Ranged = 'Ranged'
}

enum MoveType {
  Standard = 'Standard',
  Finishing = 'Finishing',
  Combo = 'Combo'
}

enum TagType {
  Damage = 'Damage',
  Ranged = 'Ranged',
  AOE = 'AOE',
  Immobilize = 'Immobilize',
  CooldownReduction = 'Cooldown Reduction'
}

type Move = {
  name: String;
  level: number;
  attack_type: AttackType;
  move_type: MoveType;
  tags: Tag[];
}

type Tag = {
  type: TagType;
  damage_cost: number;
  cooldown_cost: number;
}

const tag_costs = {
  Damage: {damage: 2, cooldown: 2},
  Ranged: {damage: -1, cooldown: 1},
  AOE: {damage: -2, cooldown: 2},
  Immobilize: {damage: -3, cooldown: 3},
  CooldownReduction: {damage: -1, cooldown: -1}
}

const example_moves = [
  {name: 'Move 1', level: 1, attack_type:AttackType.Martial, move_type:MoveType.Standard, tags:[{type:TagType.Damage, damage_cost: 2, cooldown_cost: 2}, {type:TagType.Ranged, damage_cost: -1, cooldown_cost: 0}]},
  {name: 'Move 2', level: 2, attack_type:AttackType.Melee, move_type:MoveType.Standard, tags:[{type:TagType.Damage, damage_cost: 2, cooldown_cost: 2}, {type:TagType.Damage, damage_cost: 2, cooldown_cost: 2}, {type:TagType.Ranged, damage_cost: -1, cooldown_cost: 0}]}
]

function calculate_damage(type: MoveType, level:number, tags: Tag[]) {
  let damage = 1;

  if (type == MoveType.Standard){
    damage += level * 2;

    for (const tag of tags){
      damage += tag.damage_cost;
    }
  } else if (type == MoveType.Finishing) {
    damage = level;
    damage -= tags.length;
  } else if (type == MoveType.Combo) {
    damage = level + 1;
    damage -= tags.length;
  }

  return damage;
}

function calculate_cooldown(type: MoveType, tags: Tag[]) {
  let cooldown = 0;

  if (type == MoveType.Standard){
    for (const tag of tags){
      cooldown += tag.cooldown_cost;
    }
  }

  return cooldown;
}

function calculate_xp(type: MoveType, level:number, tags: Tag[]) {
  let xp = 0;

  switch (type) {
    case MoveType.Standard:
      for (const tag of tags) {
        if (tag.type == TagType.Damage) {
          xp += 2;
        }
      }
      xp += level * 2;
      break;
    case MoveType.Finishing:
      xp = 6;
      xp += level * 2;
      break;
    case MoveType.Combo:
      xp = 8;
      xp += level * 2;
      break;
  }

  return xp;
}

function print_tags(tags:Tag[]) {
  let tagString = '';
  let damages = 0;
  let aoes = 0;
  let ranged = false;
  let immobilize = false;
  let cdreductions = 0;

  for (const tag of tags){
    switch (tag.type) {
      case TagType.Damage:
        damages++;
        break;
      case TagType.AOE:
        aoes++;
        break;
      case TagType.Ranged:
        ranged = true;
        break;
      case TagType.Immobilize:
        immobilize = true;
        break;
      case TagType.CooldownReduction:
        cdreductions++;
    }
  }

  if(damages > 0) {
    tagString += 'Damage ' + damages + ', ';
  }
  if(ranged) {
    tagString += 'Ranged, ';
  }
  if(aoes > 0) {
    tagString += 'AOE ' + aoes + ', ';
  }
  if(immobilize) {
    tagString += 'Immobilize, ';
  }
  if(cdreductions > 0) {
    tagString += 'Cooldown Reduction ' + cdreductions + ', ';
  }

  if (tagString.length > 0) {
    tagString = tagString.substring(0, tagString.length - 2);
  }

  return tagString;
}

export default function App() {
  const [moves, setMoves] = useState<Array<Move>>([]);

  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState(1);
  const [newAttackType, setNewAttackType] = useState(AttackType.Martial);
  const [newMoveType, setNewMoveType] = useState(MoveType.Standard);
  const [newTags, setNewTags] = useState<Array<Tag>>([]);

  const [newTagType, setNewTagType] = useState<TagType|string>('');
  const [newTagCost, setNewTagCost] = useState('');

  const [opened, { open, close }] = useDisclosure(false);
  
  function addMove(){
    let newMove = {name: newName, level: newLevel, attack_type:newAttackType, move_type:newMoveType, tags:newTags};
    setMoves([...moves, newMove])
    init_new_move()
  }

  function init_new_move() {
    setNewName('');
    setNewLevel(1);
    setNewAttackType(AttackType.Martial);
    setNewMoveType(MoveType.Standard);
    setNewTags([]);
  }

  function reset_tags(updatedAttackType:AttackType|null, updatedMoveType:MoveType|null) {
    let new_tags: Tag[] = [];
    if (updatedAttackType != null) {
      if (updatedMoveType != null) {
        if (updatedAttackType == AttackType.Ranged && updatedMoveType == MoveType.Standard) {
          new_tags.push({type:TagType.Ranged, damage_cost: -1, cooldown_cost: 0})
        }
      } else {
        if (updatedAttackType == AttackType.Ranged && newMoveType == MoveType.Standard) {
          new_tags.push({type:TagType.Ranged, damage_cost: -1, cooldown_cost: 0})
        }
      }
    } else {
      if (updatedMoveType != null) {
        if (newAttackType == AttackType.Ranged && updatedMoveType == MoveType.Standard) {
          new_tags.push({type:TagType.Ranged, damage_cost: -1, cooldown_cost: 0})
        }
      } else {
        if (newAttackType == AttackType.Ranged && newMoveType == MoveType.Standard) {
          new_tags.push({type:TagType.Ranged, damage_cost: -1, cooldown_cost: 0})
        }
      }
    }
    setNewTags(new_tags);
  }

  function changeAttackType(value: string|null) {
    if (value != null){
      const type = AttackType[value as keyof typeof AttackType];
      setNewAttackType(type);
      reset_tags(type, null);
    }
  }

  function changeMoveType(value: string|null) {
    if (value != null) {
      const type = MoveType[value as keyof typeof MoveType];
      setNewMoveType(type);
      reset_tags(null, type);
    }
  }

  function getAvailableTagTypes() {
    let availableTags = [];
    let currentCooldown = calculate_cooldown(newMoveType, newTags);
    let currentDamage = calculate_damage(newMoveType, newLevel, newTags);
    let containsRanged = false;
    let containsImmobilize = false;

    for (const tag of newTags) {
      if (tag.type == TagType.Ranged) {
        containsRanged = true;
      }
      if (tag.type == TagType.Immobilize) {
        containsImmobilize = true;
      }
    }

    if (newMoveType == MoveType.Standard) {
      if (currentCooldown <= 3){
        availableTags.push(TagType.Damage);
      }
      if (!containsRanged && (currentCooldown <= 4 || currentDamage >= 1)) {
        availableTags.push(TagType.Ranged);
      }
      if (currentCooldown <= 3 || currentDamage >= 2) {
        availableTags.push(TagType.AOE);
      }
      if (!containsImmobilize && (currentCooldown <= 2 || currentDamage >= 3)) {
        availableTags.push(TagType.Immobilize);
      }
      if (currentCooldown >= 1 && currentDamage >= 1) {
        availableTags.push(TagType.CooldownReduction);
      }
    } else {
      if (currentDamage >= 2) {
        availableTags.push(TagType.AOE);
        if (!containsImmobilize) {
          availableTags.push(TagType.Immobilize);
        }
      }
    }


    return availableTags;
  }

  function getAvailableCosts() {
    let availableCosts = [];

    let currentCooldown = calculate_cooldown(newMoveType, newTags);
    let currentDamage = calculate_damage(newMoveType, newLevel, newTags);

    if (newMoveType == MoveType.Standard) {
      switch (newTagType) {
        case TagType.Ranged:
          if (currentDamage >= 1) availableCosts.push('Damage');
          if (currentCooldown <= 4) availableCosts.push('Cooldown');
          break;
        case TagType.AOE:
          if (currentDamage >= 2) availableCosts.push('Damage');
          if (currentCooldown <= 3) availableCosts.push('Cooldown');
          break;
        case TagType.Immobilize:
          if (currentDamage >= 3) availableCosts.push('Damage');
          if (currentCooldown <= 2) availableCosts.push('Cooldown');
          break;
      }
    }

    return availableCosts;
  }

  function clearTags() {
    setNewTags([]);
  }

  function saveTag() {
    let newType = TagType[newTagType.replace(/\s/g, "") as keyof typeof TagType];
    let newDamage = 0;
    let newCD = 0;
    switch (newType) {
      case TagType.Damage:
        newDamage = 2;
        newCD = 2;
        break;
      case TagType.Ranged:
        if(newTagCost == 'Damage') {
          newDamage = -1;
        } else if(newTagCost == 'Cooldown') {
          newCD = 1;
        }
        break;
      case TagType.AOE:
        if(newTagCost == 'Damage') {
          newDamage = -2;
        } else if(newTagCost == 'Cooldown') {
          newCD = 2;
        }
        break;
      case TagType.Immobilize:
        if(newTagCost == 'Damage') {
          newDamage = -3;
        } else if(newTagCost == 'Cooldown') {
          newCD = 3;
        }
        break;
      case TagType.CooldownReduction:
        newDamage = -1;
        newCD = -1;
        break;
    }
    let newTag:Tag = {type: newType, damage_cost: newDamage, cooldown_cost: newCD }

    setNewTags([...newTags, newTag]);
    close();
    setNewTagType('');
    setNewTagCost('');
  }

  const rows = moves.map((move, index) => (
    <Table.Tr key={index}>
      <Table.Td>{move.name}</Table.Td>
      <Table.Td>{move.level}</Table.Td>
      <Table.Td>{move.attack_type}</Table.Td>
      <Table.Td>{move.move_type}</Table.Td>
      <Table.Td>{calculate_damage(move.move_type, move.level, move.tags)}</Table.Td>
      <Table.Td>{calculate_cooldown(move.move_type, move.tags)}</Table.Td>
      <Table.Td>{print_tags(move.tags)}</Table.Td>
      <Table.Td>{calculate_xp(move.move_type, move.level, move.tags)}</Table.Td>
    </Table.Tr>
  ));

  return (
    <MantineProvider theme={theme}>
      <AppShell
        header={{ height: 60 }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Anchor href="/kr-rpg-move-builder" underline="never" size="xl">Kamen Rider RPG Move Builder</Anchor>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <Container>
            <Table mb={10}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Level</Table.Th>
                  <Table.Th>Attack Type</Table.Th>
                  <Table.Th>Move Type</Table.Th>
                  <Table.Th>Damage</Table.Th>
                  <Table.Th>Cooldown</Table.Th>
                  <Table.Th>Tags</Table.Th>
                  <Table.Th>XP Cost</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
            <Accordion variant="contained">
              <Accordion.Item key="1" value="1">
                <Accordion.Control>Add New Move</Accordion.Control>
                <Accordion.Panel>
                  <Fieldset mb={5}>
                    <TextInput
                      label="Name"
                      value={newName}
                      onChange={(event) => setNewName(event.currentTarget.value)}
                    />
                    <NumberInput label="Level" min={1} max={3} value={newLevel} onChange={setNewLevel} />
                    <Select label="Attack Type" data={[AttackType.Martial,AttackType.Melee,AttackType.Ranged]} value={newAttackType} onChange={changeAttackType} />
                    <Select label="Move Type" data={[MoveType.Standard, MoveType.Finishing, MoveType.Combo]} value={newMoveType} onChange={changeMoveType} />
                    <p>Tags: {print_tags(newTags)}</p>
                    { getAvailableTagTypes().length > 0 && (<Button mr={5} onClick={open}>Add Tag</Button>)}
                    { newTags.length > 0 && (<Button onClick={clearTags}>Clear Tags</Button>)}
                    <p>Current Damage: {calculate_damage(newMoveType, newLevel, newTags)}</p>
                    <p>Current Cooldown: {calculate_cooldown(newMoveType, newTags)}</p>
                    <p>Current XP Cost: {calculate_xp(newMoveType, newLevel, newTags)}</p>
                  </Fieldset>
                  <Button mr={5} onClick={addMove}>Add Move</Button>
                  <Button onClick={init_new_move}>Clear</Button>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Container>
        </AppShell.Main>
      </AppShell>
      <Modal opened={opened} onClose={close} title="Add Tag" centered>
        <Select label="Tag Type" data={getAvailableTagTypes()} value={newTagType} onChange={setNewTagType} />
        { getAvailableCosts().length > 0 && (<Select label="Cost" data={getAvailableCosts()} value={newTagCost} onChange={setNewTagCost} />)}
        <Button onClick={saveTag}>Save</Button>
      </Modal>
    </MantineProvider>
    );
}
