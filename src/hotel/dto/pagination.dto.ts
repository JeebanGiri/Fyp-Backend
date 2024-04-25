import { IsInt, IsOptional } from "class-validator";

export class PaginationDto{
    @IsInt()
    @IsOptional()
    page?: number;

    @IsInt()
    @IsOptional()
    limit?: number;
}