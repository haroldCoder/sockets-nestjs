import Phaser from "phaser"

export const updatePlayers = (
  scene: Phaser.Scene,
  players: Array<{ id: string; x: number; y: number }>,
) => {
  players.forEach((player) => {
    const existingSprite = scene.children.getByName(
      player.id,
    ) as Phaser.GameObjects.Sprite;

    if (existingSprite) {
      existingSprite.setPosition(player.x, player.y);
    } else {
      
      scene.add.sprite(player.x, player.y, 'dude').setName(player.id);
    }
  });

  scene.children.list.forEach((child) => {
    if (
      child instanceof Phaser.GameObjects.Sprite &&
      !players.some((p) => p.id === child.name)
    ) {
      child.destroy();
    }
  });
};
