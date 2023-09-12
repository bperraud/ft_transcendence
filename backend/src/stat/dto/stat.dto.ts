import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateStatDto {
  @IsNumber()
  @IsNotEmpty()
  result: number;

  @IsString()
  @IsNotEmpty()
  opponentId: number;

  @IsNumber()
  score1: number;

  @IsNumber()
  score2: number;
}
