import { Injectable } from '@nestjs/common';
import { PrismaClient, Rank } from '@prisma/client';
import { UpdateStatDto } from './dto';
import { NotFoundException } from '@nestjs/common';
import Elo from '@studimax/elo';

@Injectable()
export class StatService {
  constructor(private prisma: PrismaClient) {}

  updateLadder(playerElo: number): Rank {
    if (playerElo < 1000) {
      return 'BRONZE';
    } else if (playerElo <= 1100) {
      return 'SILVER';
    } else if (playerElo <= 1200) {
      return 'GOLD';
    } else if (playerElo <= 1300) {
      return 'PLATINUM';
    } else if (playerElo <= 1400) {
      return 'DIAMOND';
    }
  }

  async updateStat(userId: number, dto: UpdateStatDto) {
    const playerA = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { stat: true },
    });
    const playerB = await this.prisma.user.findUnique({
      where: { id: dto.opponentId },
      include: { stat: true },
    });
    const elo = new Elo({ kFactor: 20 });
    const { Ra, Rb } = elo.calculateRating(
      playerA.stat.elo,
      playerB.stat.elo,
      dto.result,
    );
    playerA.stat.elo = Math.round(Ra);
    playerB.stat.elo = Math.round(Rb);
    playerA.stat.ladder = this.updateLadder(playerA.stat.elo);
    playerB.stat.ladder = this.updateLadder(playerB.stat.elo);

    let winnerId: number;
    let loserId: number;
    let scoreLoser: number;
    let scoreWinner: number;
    if (dto.result === 1) {
      [winnerId, loserId, scoreWinner, scoreLoser] = [
        playerA.id,
        playerB.id,
        dto.score1,
        dto.score2,
      ];
      playerA.stat.wins += 1;
      playerB.stat.losses += 1;
    } else {
      [winnerId, loserId, scoreWinner, scoreLoser] = [
        playerB.id,
        playerA.id,
        dto.score2,
        dto.score1,
      ];
      playerA.stat.losses += 1;
      playerB.stat.wins += 1;
    }
    await this.prisma.stat.update({
      where: { id: playerA.stat.id },
      data: {
        ...playerA.stat,
      },
    });
    await this.prisma.stat.update({
      where: { id: playerB.stat.id },
      data: {
        ...playerB.stat,
      },
    });

    const match = await this.prisma.match.create({
      data: {
        scoreWinner: scoreWinner,
        scoreLoser: scoreLoser,
        winner: {
          connect: { id: winnerId },
        },
        loser: {
          connect: { id: loserId },
        },
      },
    });

    return match;
  }

  async getHistory(playerId: number) {
    try {
      const history = await this.prisma.$queryRaw<
        any[]
      >`SELECT (CASE WHEN m."winnerId" = ${playerId} THEN 'Win' ELSE 'Lose' END) as result,
	  	 u.username, m."createdAt"
		 FROM "public"."User" AS u
		 JOIN "public"."Match" As m ON "loserId" = u.id OR "winnerId" = u.id
		 WHERE u.id != ${playerId}
		 ORDER BY m."createdAt" DESC`;
      return history;
    } catch (error) {
      throw new NotFoundException('Error retrieving matches');
    }
  }

  async getStat(playerId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: playerId },
        include: { stat: true },
      });
      return user.stat;
    } catch (error) {
      throw new NotFoundException('Error retrieving stats');
    }
  }
}
