import { Injectable } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TestService {
  constructor(
		private  configService: ConfigService
	) {}

  create(createTestDto: CreateTestDto,) {
    return {message: `This action adds a new test`};
  }

  findAll() {
    //const environment = process.env.NODE_ENV
    //const frontendUrl = process.env.FRONTEND_URL
    const environment = this.configService.get<string>('environment')
    const frontendUrl = this.configService.get<string>('frontendUrl')
    return {message: `This action returns all test (environment: ${environment} - frontendUrl: ${frontendUrl})`};
  }

  findOne(id: number) {
    return {message: `This action returns a #${id} test`};
  }

  update(id: number, updateTestDto: UpdateTestDto) {
    return {message: `This action updates a #${id} test`};
  }

  remove(id: number) {
    return {message: `This action removes a #${id} test`};
  }
}
