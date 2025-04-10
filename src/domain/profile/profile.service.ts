import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Profile } from "@entity";
import { ProfileDto } from "@domain/profile/profile.dto";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>
  ) {}

  async getProfile(profileReq: ProfileDto): Promise<any> {
    const profile: Profile = await this.profileRepository.findOne({
      where: { section: profileReq.section, entry: profileReq.entry },
    });
    return profile ? profile.value : profileReq.default;
  }

  async getProfileBool(profileReq: ProfileDto): Promise<any> {
    const profile: Profile = await this.profileRepository.findOne({
      where: { section: profileReq.section, entry: profileReq.entry },
    });

    let resultValue = false;

    if (profile?.value == "true") {
      resultValue = true;
    }
    return resultValue ? resultValue : profileReq.default;
  }
}
