import { tags } from 'typia';
import { CustomTags } from '../../common/validation/typia.tags';

export namespace UserDto {
	export type Entity = {
		id: string;
		email: string;
		name: string | null;
		username: string | null;
		avatarFilename: string | null;
	};

	export type Creation = {
		email: string & tags.MinLength<3> & tags.MaxLength<128> & tags.Format<'email'>;
		password: string &
			tags.MinLength<8> &
			tags.MaxLength<64> &
			CustomTags.ContainsDigit &
			CustomTags.ContainsLowercase &
			CustomTags.ContainsUppercase;
	};

	export type Login = {
		email: string;
		password: string;
	};
}
