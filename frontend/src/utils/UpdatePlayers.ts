import Phaser from "phaser"

export const updatePlayers = (
  scene: Phaser.Scene,
  players: Array<{ id: string; x: number; y: number; health: number }>,
) => {
  players.forEach((player) => {
    const existingSprite = scene.children.getByName(
      player.id,
    ) as Phaser.GameObjects.Sprite;

    if (existingSprite) {
      existingSprite.setPosition(player.x, player.y);

      // Update health bar position and fill
      const healthBarBg = scene.children.getByName(`health-bg-${player.id}`) as Phaser.GameObjects.Rectangle;
      const healthBarFill = scene.children.getByName(`health-fill-${player.id}`) as Phaser.GameObjects.Rectangle;

      if (healthBarBg && healthBarFill) {
        healthBarBg.setPosition(player.x, player.y - 25);
        healthBarFill.setPosition(player.x - 18, player.y - 25);
        healthBarFill.width = (player.health / 100) * 36;

        // Change color based on health
        if (player.health > 60) {
          healthBarFill.fillColor = 0x00ff00; // Green
        } else if (player.health > 30) {
          healthBarFill.fillColor = 0xffff00; // Yellow
        } else {
          healthBarFill.fillColor = 0xff0000; // Red
        }
      }
    } else {
      // Create new player sprite
      scene.add.sprite(player.x, player.y, 'dude').setName(player.id);

      // Create health bar background
      const healthBarBg = scene.add.rectangle(player.x, player.y - 25, 40, 6, 0x000000).setName(`health-bg-${player.id}`);
      healthBarBg.setStrokeStyle(2, 0xffffff);

      // Create health bar fill
      const healthBarFill = scene.add.rectangle(player.x - 18, player.y - 25, (player.health / 100) * 36, 4, 0x00ff00).setName(`health-fill-${player.id}`);
      healthBarFill.setOrigin(0, 0.5);
    }
  });

  // Remove sprites and health bars for disconnected players
  scene.children.list.forEach((child) => {
    if (
      child instanceof Phaser.GameObjects.Sprite &&
      !players.some((p) => p.id === child.name || child.name.startsWith(`health-bg-${p.id}`) || child.name.startsWith(`health-fill-${p.id}`))
    ) {
      child.destroy();
    }
  });
};
