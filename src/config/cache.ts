import { Injectable } from '@nestjs/common'
import { CacheOptionsFactory, CacheModuleOptions } from '@nestjs/cache-manager'
@Injectable()
export class CacheService implements CacheOptionsFactory {
	createCacheOptions(): CacheModuleOptions {
		return {
			ttl: 24 * 60 * 60, // Cache expires in 24 hours
			max: 10 // maximum number of items in cache
		}
	}
}
