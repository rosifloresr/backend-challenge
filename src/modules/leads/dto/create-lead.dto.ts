import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateLeadDto{
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?:string;

    @IsOptional()
    @IsString()
    company?: string;
}