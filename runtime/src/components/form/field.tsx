import { withJsonFormsControlProps } from '@jsonforms/react'
import { useState } from 'react'
import { Base } from './base'
import { HiOutlineEye as EyeIcon, HiOutlineEyeSlash as EyeCloseIcon } from 'react-icons/hi2'

export const FieldRenderer = withJsonFormsControlProps(
	({ data, handleChange, path, label, errors, schema }) => {
		const [ showPassword, setShowPassword ] = useState(false)

		let inputType = 'text'
		if (schema.format === 'email') {
			inputType = 'email'
		} else if (schema.format === 'password' && !showPassword) {
			inputType = 'password'
		} else if (schema.format === 'password' && showPassword) {
			inputType = 'text'
		}

		const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const val = e.target.value
			if (val === '') {
				handleChange(path, undefined)
				return
			}
			handleChange(path, val)
		}

		return (
			<Base label={label} errors={errors} path={path} hasValue={data !== undefined && data !== null && data !== ''}>
				<div className="relative flex items-center w-full">
					<input
						type={inputType}
						value={data ?? ''}
						onChange={onChange}
						placeholder=""
						className={`w-full px-3 py-2 bg-transparent text-sm text-gray-900 dark:text-white/90 outline-none ${schema.format === 'password' ? 'pr-14' : ''}`}
					/>
					{schema.format === 'password' && (
						<div className="absolute right-3 flex items-center gap-2 z-30">
							<div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800" />
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 flex items-center justify-center"
							>
								{showPassword ? (
									<EyeIcon className="fill-current w-[18px] h-[18px]" />
								) : (
									<EyeCloseIcon className="fill-current w-[18px] h-[18px]" />
								)}
							</button>
						</div>
					)}
				</div>
			</Base>
		)
	}
)
