import { IsString, IsEnum, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
    CROSSPROMO = 'crosspromo',
    LIVEOPS = 'liveops',
    APP = 'app',
    ADS = 'ads',
}

export class CreateEventDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ enum: EventType })
    @IsEnum(EventType)
    type: EventType;

    @ApiProperty({ minimum: 0, maximum: 10 })
    @IsInt()
    @Min(0)
    @Max(10)
    priority: number;
}