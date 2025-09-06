import typia from 'typia';

export namespace CustomTags {
	/* Если в кастомном типе не используется поле value (т.е. тип не является дженериком),
	 *  то поле value в нём следует помечать
	 *  не как <value: undefined;>
	 *  а как  <value: "undefined";> - строкой.
	 *  Нужно для корректного билда sdk.
	 */

	export type ContainsUppercase = typia.tags.TagBase<{
		kind: 'ContainsUppercase';
		target: 'string';
		value: undefined;
		validate: `$input.match(/[A-Z]/) !== null`;
	}>;

	export type ContainsLowercase = typia.tags.TagBase<{
		kind: 'ContainsLowercase';
		target: 'string';
		value: undefined;
		validate: `$input.match(/[a-z]/) !== null`;
	}>;

	export type ContainsDigit = typia.tags.TagBase<{
		kind: 'ContainsDigit';
		target: 'string';
		value: undefined;
		validate: `$input.match(/[0-9]/) !== null`;
	}>;
}
