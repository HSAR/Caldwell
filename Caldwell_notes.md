## Development Notes (TODOs)

- Physics engine integration with Excalibur
  - Reposition ex.Actor objects on screen every update
  - Remove objects from physics simulation on kill
  - System for converting images to convex bounding boxes (will remove need to make collision meshes)

## Gameplay Design Notes

- Side-scrolling vehicle swinging through cavern 
- Player roles
  - P1 handles movement: projective-based grappling hook onto environment/enemy (enemy takes damage)
  - P2 handles guns/miscellaneous

- Weapons have physical attributes - guns have recoil, limited (weight-costing) ammunition
- Customisation for both P1 and P2, mostly balanced on weight (lightness = better maneuverability)
  - P1 customises the vehicle
    - Armour plating (+ protection - lightness)
    - Hook firing system (+ faster projectile - lightness - energy)
    - Reactor (+ energy - lightness)
    - Turret (+ weapon mounts - lightness)
  - P2 customises the weaponry
    - Weapon (+ firepower - lightness)
      - Energy weapons? (+ firepower - energy)
    - Ammunition (+ ammo - lightness)
    - Ammo feed (+ firerate max rate - lightness)
    - Cooling (+ firerate sustained - lightness)
