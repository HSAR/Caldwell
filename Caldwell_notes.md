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
  - Loading and retrieving static data (textures, properties)
    - Global static object?
    - (Future) Investigate objects with dynamic properties: for example, a weapon with high heat capacity, but that becomes less accurate when hot.
  
## NB

- p2 co-ordinate system is upside-down relative to Excalibur's
  - Example: To place a floor, we create a plane at 0,[game height] and rotate it 180 degrees

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
    - Ammo feed (+ max firerate - lightness)
      - Magazines (+ rounds fired at max firerate - reload time - lightness (loader + magazine weight))
      - Pools (+ rounds fired at max firerate - lightness)
      - Belt (rounds fired at rate of loader)
    - Cooling (+ firerate sustained - lightness)
