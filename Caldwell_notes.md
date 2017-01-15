## Development Notes (TODOs)

- debug support
  - <del>How do we attach the vscode debugger to electron?</del>
    - Fix source map support
  - <del>Pass through console log messages</del>

- Physics engine integration with Excalibur
  - <del>Reposition ex.Actor objects on screen every update</del>
  - <del>Remove objects from physics simulation on kill (onKill doesn't seem to work)</del>
  - <del>System to automatically generate collision shapes from bitmaps</del>  
  - Point tracking on actors (e.g. ejection port, muzzle, attached flashlight)
  - Child actors (actors attached to other actors)
  
- Networking
  - Server implementation - matchmaking?
  - Peer-to-peer architecture?
    - Game state synchronisation
    
- Server
  - User profiles from SSO services
  - Persistent storage
  - Front-end UX and features?

- Game object modelling
  - Loading and retrieving static data (textures, properties) - [link](http://excaliburjs.com/docs/api/v0.8.0/classes/ex.resource.html)
    - Global static object?
      - Retrieve data objects by ID and expected type?
    - Serialization & deserialization
    - (Future) Investigate objects with dynamic properties: for example, a weapon with high heat capacity, but that becomes less accurate when hot.

- Game content
  - (Future) Damage types? Ammo variety, armour resistance values.
    - Armour piercing
    - Incendiary
    - High explosive


  
## NB

- p2 co-ordinate system is upside-down relative to Excalibur's
  - Example: To place a floor, we create a plane at 0,[game height] and rotate it 180 degrees

- Game model
  - Ships are composed out of items that fit into slots (i.e. `engine_ion_40kW` equips into `slot_engine_rear`).
    - Ship hulls provide slots. Some provide more, some provide less.
    - Items can provide slots, but don't have to. 
      - For example, `optic_laserTargeter` equips into `slot_optic_targeter` provided by `weapon_launcher_missile__mk57_8cell`. `optic_laserTargeter` doesn't provide any slots, so nothing is equipped on it.
  - Items must consume at least one slot, but may consume any number of slots.
  - Items have key attributes. 
    - Mass affects ship handling and weapon aiming speed.
      - Higher-powered and heavier engines have higher thrust.
      - Higher-powered and heavier thruster systems (optional) allow the ship to turn faster.
      - Higher-powered and heavier weapon mounts shift guns faster and to wider arcs of fire.
    - Power draw shuts down the ship if energy supply does not match demand. Total shutdown, not partial shutdown (prevents E:D-like necessity for configuration of energy priority).
      - Heavier reactors provide more energy.
      - Adding capacitor batteries provide short-term refilling pools of energy. Possible to factor in inefficiency?
  - (Future) Slots only support a limited mass and power draw?
  - Armour protects a certain component and is degraded when hit. 
    - Perpendicular hits transfer full damage, angled hits proportionally less.
    - Item HP? Armoured items (e.g. turrets, ammo boxes)?
    - (Future) Line of sight, damage localisation? Armour plates should protect components underneat, but only underneath.

  - Reactor weight example
    - MT30 gas turbine
      - Mass: 77000 kg
      - Energy: 36000000 W


## Gameplay Design Notes

- Side-scrolling vehicle swinging through cavern 
- Player roles
  - P1 handles movement: projectile-based grappling hook onto environment/enemy (enemy takes damage)
  - P2 handles equipment: guns, defences, power

- Weapons have physical attributes - guns have recoil, limited (weight-costing) ammunition
- Customisation for both P1 and P2, mostly balanced on weight (lightness = better maneuverability)
  - P1 customises the vehicle
    - Armour plating (+ protection - lightness)
    - Hook firing system (+ faster projectile - lightness - energy)
    - Power systems (+ energy - lightness)
      - Reactor (+ continuous energy - lots of lightness)
         - "Fueled" reactors? Require "ammo", but much lighter than normal
      - Capacitors (+ pool of energy - lightness)
    - Turret (+ weapon mounts - lightness) (mounts are roughly 25-50% the mass of the weapon they mount)
        - Shock absorbing mounts (+ recoil reduction - lightness)
  - P2 customises the weaponry
    - Weapon (+ firepower - lightness)
      - Energy weapons? (+ firepower - energy)
    - Ammunition (+ ammo - lightness)
    - Ammo feed (+ max firerate - lightness)
      - Magazines (+ rounds fired at max firerate - reload time - lightness (loader + magazine weight))
      - Pools (+ rounds fired at max firerate - lightness)
      - Belt (rounds fired at rate of loader)
    - Cooling (+ firerate sustained - lightness)
