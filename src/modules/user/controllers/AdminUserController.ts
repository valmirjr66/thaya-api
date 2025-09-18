import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import BaseController from '../../../BaseController';
import GetAdminUserInfoResponseDto from '../dto/admin/GetAdminUserInfoResponseDto';
import AuthenticateUserRequestDto from '../dto/AuthenticateUserRequestDto';
import AdminUserService from '../AdminUserService';

@ApiTags('User')
@Controller('admin-users')
export default class AdminUserController extends BaseController {
    constructor(private readonly adminUserService: AdminUserService) {
        super();
    }

    @Post('/authenticate')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        schema: { example: { id: 'string' } },
    })
    @ApiBadRequestResponse({
        description: RESPONSE_DESCRIPTIONS.BAD_REQUEST,
    })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async authenticateUser(
        @Body() dto: AuthenticateUserRequestDto,
    ): Promise<{ id: string }> {
        const response = await this.adminUserService.authenticateUser(dto);

        if (response === 'invalid credentials') {
            throw new HttpException(
                'Invalid credentials',
                HttpStatus.BAD_REQUEST,
            );
        } else if (response === 'email not found') {
            throw new HttpException(
                'E-mail is not registered',
                HttpStatus.BAD_REQUEST,
            );
        } else {
            return response;
        }
    }

    @Get('/:id')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: GetAdminUserInfoResponseDto,
    })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getUserInfoById(
        @Param('id') id: string,
    ): Promise<GetAdminUserInfoResponseDto> {
        const response = await this.adminUserService.getUserInfoById(id);
        this.validateGetResponse(response);
        return response;
    }
}
