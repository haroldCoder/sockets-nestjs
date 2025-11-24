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

      const healthBarBg = scene.children.getByName(`health-bg-${player.id}`) as Phaser.GameObjects.Rectangle;
      const healthBarFill = scene.children.getByName(`health-fill-${player.id}`) as Phaser.GameObjects.Rectangle;

      if (healthBarBg && healthBarFill) {
        healthBarBg.setPosition(player.x, player.y - 25);
        healthBarFill.setPosition(player.x - 18, player.y - 25);
        healthBarFill.width = (player.health / 100) * 36;

        if (player.health > 60) {
          healthBarFill.fillColor = 0x00ff00;
        } else if (player.health > 30) {
          healthBarFill.fillColor = 0xffff00;
        } else {
          healthBarFill.fillColor = 0xff0000;
        }
      }
    } else {
      scene.add.sprite(player.x, player.y, 'dude').setName(player.id);

      const healthBarBg = scene.add.rectangle(player.x, player.y - 25, 40, 6, 0x000000).setName(`health-bg-${player.id}`);
      healthBarBg.setStrokeStyle(2, 0xffffff);

      const healthBarFill = scene.add.rectangle(player.x - 18, player.y - 25, (player.health / 100) * 36, 4, 0x00ff00).setName(`health-fill-${player.id}`);
      healthBarFill.setOrigin(0, 0.5);
    }
  });

  scene.children.list.forEach((child) => {
    if (child instanceof Phaser.GameObjects.Sprite) {
      if ((child.name && child.name === 'monster') || (child.getData && child.getData('isMonster'))) {
        return;
      }

      const belongsToPlayer = players.some((p) => p.id === child.name || (child.name && (child.name as string).startsWith(`health-bg-${p.id}`)) || (child.name && (child.name as string).startsWith(`health-fill-${p.id}`)));
      if (!belongsToPlayer) {
        child.destroy();
      }
    }
  });
};
