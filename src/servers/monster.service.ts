import { Injectable } from '@nestjs/common';
import type { Cell } from './servers.gateway';

interface PathNode {
    x: number;
    y: number;
    g: number;
    h: number;
    f: number;
    parent: PathNode | null;
}

@Injectable()
export class MonsterService {
    private monster: { x: number; y: number; targetId: string | null; health: number } = {
        x: 400,
        y: 300,
        targetId: null,
        health: 100
    };

    private readonly MONSTER_SPEED = 3.5;
    private readonly TARGET_RANGE = 400;
    private currentPath: Array<{x: number, y: number}> = [];
    private patrolWaypoints: Array<{x: number, y: number}> = [];
    private currentWaypointIndex = 0;
    private stuckCounter = 0;
    private lastPosition = { x: 0, y: 0 };

    public getMonsterState() {
        return this.monster;
    }

    public updateMonsterPosition(walls: Array<{ x: number; y: number; w: number; h: number }>, 
                               players: Map<string, { id: string; x: number; y: number; health: number }>,
                               grid?: Cell[][]) {
        const distanceMoved = this.calculateDistance(this.lastPosition.x, this.lastPosition.y, this.monster.x, this.monster.y);
        if (distanceMoved < 1.0) {
            this.stuckCounter++;
            if (this.stuckCounter > 10) {
                this.currentPath = [];
                this.stuckCounter = 0;
                // console.log('Monster stuck, clearing path');
            }
        } else {
            this.stuckCounter = 0;
        }
        this.lastPosition = { x: this.monster.x, y: this.monster.y };

        if (players.size === 0) {
            this.patrol(walls, grid);
            return;
        }

        let closestPlayer = null;
        let minDistance = Number.MAX_VALUE;

        for (const [_, player] of players) {
            const distance = this.calculateDistance(
                this.monster.x,
                this.monster.y,
                player.x,
                player.y
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestPlayer = player;
            }
        }

        if (closestPlayer && minDistance < this.TARGET_RANGE) {
            this.monster.targetId = closestPlayer.id;
            this.chasePlayer(closestPlayer, walls, grid, players);
        } else {
            this.monster.targetId = null;
            this.patrol(walls, grid, players);
        }
    }

    private chasePlayer(target: { x: number; y: number }, walls: Array<{ x: number; y: number; w: number; h: number }>, grid?: Cell[][], players?: Map<string, { id: string; x: number; y: number; health: number }>) {
        // Re-calculate path less frequently or if empty
        if (this.currentPath.length === 0 || Math.random() < 0.1) {
            if (grid) {
                this.currentPath = this.findPathGrid(
                    { x: this.monster.x, y: this.monster.y },
                    { x: target.x, y: target.y },
                    grid
                );
                // console.log(`Path found: ${this.currentPath.length} steps`);
            } else {
                // Fallback to old pathfinding if grid is missing (shouldn't happen)
                this.currentPath = []; 
            }
        }

        if (this.currentPath.length > 0) {
            const nextPoint = this.currentPath[0];
            const distance = this.calculateDistance(this.monster.x, this.monster.y, nextPoint.x, nextPoint.y);
            
            // If close enough to the next point, move to the next one
            if (distance < this.MONSTER_SPEED) {
                this.currentPath.shift();
                if (this.currentPath.length > 0) {
                     this.moveTowards(this.currentPath[0], walls, players);
                }
            } else {
                this.moveTowards(nextPoint, walls, players);
            }
        } else {
            // Direct movement if no path (fallback)
            // console.log("No path, moving directly");
            this.moveTowards(target, walls, players);
        }
    }

    private patrol(walls: Array<{ x: number; y: number; w: number; h: number }>, grid?: Cell[][], players?: Map<string, { id: string; x: number; y: number; health: number }>) {
        if (this.patrolWaypoints.length === 0) {
            this.generatePatrolWaypoints(walls);
        }

        if (this.patrolWaypoints.length > 0) {
            const waypoint = this.patrolWaypoints[this.currentWaypointIndex];
            const distance = this.calculateDistance(this.monster.x, this.monster.y, waypoint.x, waypoint.y);
            
            if (distance < 20) {
                this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.patrolWaypoints.length;
                this.currentPath = [];
            } else {
                if (this.currentPath.length === 0) {
                     if (grid) {
                        this.currentPath = this.findPathGrid(
                            { x: this.monster.x, y: this.monster.y },
                            waypoint,
                            grid
                        );
                    }
                }
                
                if (this.currentPath.length > 0) {
                    const nextPoint = this.currentPath[0];
                    const dist = this.calculateDistance(this.monster.x, this.monster.y, nextPoint.x, nextPoint.y);
                    
                    if (dist < this.MONSTER_SPEED) {
                        this.currentPath.shift();
                        if (this.currentPath.length > 0) {
                             this.moveTowards(this.currentPath[0], walls, players);
                        }
                    } else {
                        this.moveTowards(nextPoint, walls, players);
                    }
                } else {
                    this.moveTowards(waypoint, walls, players);
                }
            }
        } else {
            this.moveRandomly(walls);
        }
    }

    private generatePatrolWaypoints(walls: Array<{ x: number; y: number; w: number; h: number }>) {
        const candidates: Array<{x: number, y: number}> = [];
        
        for (let x = 100; x < 700; x += 100) {
            for (let y = 100; y < 500; y += 100) {
                if (!this.willCollide(x, y, walls)) {
                    candidates.push({ x, y });
                }
            }
        }
        
        const numWaypoints = Math.min(6, Math.max(4, candidates.length));
        for (let i = 0; i < numWaypoints && candidates.length > 0; i++) {
            const index = Math.floor(Math.random() * candidates.length);
            this.patrolWaypoints.push(candidates[index]);
            candidates.splice(index, 1);
        }
    }

    private moveTowards(target: { x: number; y: number }, walls: Array<{ x: number; y: number; w: number; h: number }>, players?: Map<string, { id: string; x: number; y: number; health: number }>) {
        const angle = Math.atan2(target.y - this.monster.y, target.x - this.monster.x);
        const newX = this.monster.x + Math.cos(angle) * this.MONSTER_SPEED;
        const newY = this.monster.y + Math.sin(angle) * this.MONSTER_SPEED;

        if (!this.willCollide(newX, newY, walls, players)) {
            this.updatePosition(newX, newY);
        } else {
            // Slide along walls
            // console.log('Collision detected, sliding');
            if (!this.willCollide(newX, this.monster.y, walls, players)) {
                this.updatePosition(newX, this.monster.y);
            } else if (!this.willCollide(this.monster.x, newY, walls, players)) {
                this.updatePosition(this.monster.x, newY);
            } 
        }
    }

    private findPathGrid(start: {x: number, y: number}, goal: {x: number, y: number}, grid: Cell[][]): Array<{x: number, y: number}> {
        const cellSize = 64;
        const startX = Math.floor(start.x / cellSize);
        const startY = Math.floor(start.y / cellSize);
        const goalX = Math.floor(goal.x / cellSize);
        const goalY = Math.floor(goal.y / cellSize);

        if (startX < 0 || startY < 0 || startX >= grid[0].length || startY >= grid.length) return [];
        if (goalX < 0 || goalY < 0 || goalX >= grid[0].length || goalY >= grid.length) return [];

        // Simple BFS/A* on grid
        const openList: {x: number, y: number, parent: any}[] = [{x: startX, y: startY, parent: null}];
        const visited = new Set<string>();
        visited.add(`${startX},${startY}`);
        
        let foundNode = null;

        while (openList.length > 0) {
            const current = openList.shift()!;
            if (current.x === goalX && current.y === goalY) {
                foundNode = current;
                break;
            }

            const cell = grid[current.y][current.x];
            const neighbors = [];

            if (!cell.walls.top && current.y > 0) neighbors.push({x: current.x, y: current.y - 1});
            if (!cell.walls.right && current.x < grid[0].length - 1) neighbors.push({x: current.x + 1, y: current.y});
            if (!cell.walls.bottom && current.y < grid.length - 1) neighbors.push({x: current.x, y: current.y + 1});
            if (!cell.walls.left && current.x > 0) neighbors.push({x: current.x - 1, y: current.y});

            for (const n of neighbors) {
                const key = `${n.x},${n.y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    openList.push({x: n.x, y: n.y, parent: current});
                }
            }
        }

        if (foundNode) {
            const path = [];
            let curr = foundNode;
            while (curr.parent) {
                // Convert grid coordinates back to world coordinates (center of cell)
                path.unshift({
                    x: curr.x * cellSize + cellSize / 2,
                    y: curr.y * cellSize + cellSize / 2
                });
                curr = curr.parent;
            }
            return path;
        }

        return [];
    }

    private updatePosition(x: number, y: number) {
        this.monster.x = x;
        this.monster.y = y;
    }

    private moveRandomly(walls: Array<{ x: number; y: number; w: number; h: number }>) {
        const angle = Math.random() * Math.PI * 2;
        const newX = this.monster.x + Math.cos(angle) * this.MONSTER_SPEED;
        const newY = this.monster.y + Math.sin(angle) * this.MONSTER_SPEED;

        if (!this.willCollide(newX, newY, walls)) {
            this.updatePosition(newX, newY);
        }
    }

    private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    private willCollide(x: number, y: number, walls: Array<{ x: number; y: number; w: number; h: number }>, players?: Map<string, { id: string; x: number; y: number; health: number }>): boolean {
        // Reduced collision box for smoother movement
        const monsterWidth = 32; 
        const monsterHeight = 32;
        const padding = 2;
        
        const monsterRect = {
            x: x - (monsterWidth / 2) - padding,
            y: y - (monsterHeight / 2) - padding,
            w: monsterWidth + (padding * 2),
            h: monsterHeight + (padding * 2)
        };

        if (walls.some(wall => this.checkCollision(monsterRect, wall))) return true;

        if (players) {
            for (const [_, player] of players) {
                const playerRect = {
                    x: player.x - 16, // Assuming player width 32
                    y: player.y - 16, // Assuming player height 32
                    w: 32,
                    h: 32
                };
                // Allow some overlap for attacking range, but prevent full overlap
                // Using a smaller rect for player collision to allow getting close
                const collisionRect = {
                    x: playerRect.x + 8,
                    y: playerRect.y + 8,
                    w: 16,
                    h: 16
                };
                
                if (this.checkCollision(monsterRect, collisionRect)) return true;
            }
        }

        return false;
    }

    private checkCollision(rect1: { x: number; y: number; w: number; h: number },
                         rect2: { x: number; y: number; w: number; h: number }): boolean {
        return rect1.x < rect2.x + rect2.w &&
               rect1.x + rect1.w > rect2.x &&
               rect1.y < rect2.y + rect2.h &&
               rect1.y + rect1.h > rect2.y;
    }

    public takeDamage(amount: number): boolean {
        this.monster.health -= amount;
        if (this.monster.health <= 0) {
            this.monster.health = 0;
            return true;
        }
        return false;
    }

    public reset() {
        this.monster = {
            x: 400,
            y: 300,
            targetId: null,
            health: 100
        };
        this.currentPath = [];
        this.patrolWaypoints = [];
        this.currentWaypointIndex = 0;
    }
}