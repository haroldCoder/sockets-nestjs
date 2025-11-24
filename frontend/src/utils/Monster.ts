import Phaser from 'phaser';

export class Monster extends Phaser.GameObjects.Sprite {
    private health: number = 100;
    private speed: number = 1;
    private target: Phaser.GameObjects.Sprite | null = null;
    private healthBar: Phaser.GameObjects.Rectangle;
    private healthBarBg: Phaser.GameObjects.Rectangle;
    private walls: Phaser.Geom.Rectangle[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, walls: Phaser.Geom.Rectangle[]) {
        super(scene, x, y, 'monster');
        scene.add.existing(this);
        this.walls = walls;

        this.healthBarBg = scene.add.rectangle(x, y - 20, 40, 6, 0x000000);
        this.healthBar = scene.add.rectangle(x - 18, y - 20, 36, 4, 0xff0000);
        this.healthBar.setOrigin(0, 0.5);

        this.setScale(1);
        this.setDepth(1);
        
        this.startMoving();
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        
        this.healthBarBg.setPosition(this.x, this.y - 20);
        this.healthBar.setPosition(this.x - 18, this.y - 20);
        
        if (this.target) {
            const angle = Phaser.Math.Angle.Between(
                this.x,
                this.y,
                this.target.x,
                this.target.y
            );
            
            const newX = this.x + Math.cos(angle) * this.speed;
            const newY = this.y + Math.sin(angle) * this.speed;
            
            if (!this.willCollide(newX, newY)) {
                this.x = newX;
                this.y = newY;
            } else {
                if (!this.willCollide(newX, this.y)) {
                    this.x = newX;
                } else if (!this.willCollide(this.x, newY)) {
                    this.y = newY;
                } else {
                    const alt = this.findValidMove();
                    if (alt) {
                        this.x = alt.x;
                        this.y = alt.y;
                    }
                }
            }

            this.setFlipX(Math.cos(angle) < 0);
        }
    }

    private willCollide(newX: number, newY: number): boolean {
        const pw = this.displayWidth || this.width || 32;
        const ph = this.displayHeight || this.height || 32;
        const rect = new Phaser.Geom.Rectangle(newX - pw / 2, newY - ph / 2, pw, ph);

        const padding = 6;
        for (const w of this.walls) {
            const wx = (w as any).x ?? 0;
            const wy = (w as any).y ?? 0;
            const ww = (w as any).width ?? (w as any).w ?? 0;
            const wh = (w as any).height ?? (w as any).h ?? 0;

            const expanded = new Phaser.Geom.Rectangle(wx - padding, wy - padding, ww + padding * 2, wh + padding * 2);
            if (Phaser.Geom.Intersects.RectangleToRectangle(rect, expanded)) return true;
        }
        return false;
    }

    private findValidMove(): { x: number, y: number } | null {
        const directions = [
            { x: 0, y: -this.speed },
            { x: this.speed, y: 0 },
            { x: 0, y: this.speed },
            { x: -this.speed, y: 0 }
        ];

        directions.sort(() => Math.random() - 0.5);

        for (const dir of directions) {
            const newX = this.x + dir.x;
            const newY = this.y + dir.y;
            if (!this.willCollide(newX, newY)) {
                return { x: newX, y: newY };
            }
        }
        return null;
    }

    private startMoving() {
        if (this.target) return;

        const move = () => {
            if (!this.target) {
                const validMove = this.findValidMove();
                if (validMove) {
                    this.x = validMove.x;
                    this.y = validMove.y;
                }
                
                this.scene.time.delayedCall(100, move);
            }
        };

        move();
    }

    public setTarget(player: Phaser.GameObjects.Sprite) {
        this.target = player;
    }

    public clearTarget() {
        this.target = null;
        this.startMoving();
    }

    public takeDamage(amount: number) {
        this.health -= amount;
        
        this.healthBar.width = (this.health / 100) * 46;
        
        if (this.health <= 0) {
            this.destroy();
            this.healthBar.destroy();
            this.healthBarBg.destroy();
        }
    }

    public destroy(fromScene?: boolean) {
        super.destroy(fromScene);
        if (this.healthBar) this.healthBar.destroy();
        if (this.healthBarBg) this.healthBarBg.destroy();
    }
}