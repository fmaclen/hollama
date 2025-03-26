// Types for reasoning tag handling
export type TagPair = {
	openTag: string;
	closeTag: string;
};

export type TagWithPosition = TagPair & {
	index: number;
};

export type CompleteTagPair = TagPair & {
	openIndex: number;
	closeIndex: number;
};

// Reasoning tag constants
export const THOUGHT_TAG = '<thought>';
export const END_THOUGHT_TAG = '</thought>';
export const THINK_TAG = '<think>';
export const END_THINK_TAG = '</think>';

// Tags to consider as reasoning content markers
export const REASONING_TAGS: TagPair[] = [
	{ openTag: THOUGHT_TAG, closeTag: END_THOUGHT_TAG },
	{ openTag: THINK_TAG, closeTag: END_THINK_TAG }
];

/**
 * Helper function to find first opening and closing tags in buffer
 * Returns an object with opening/closing tags and their positions, or null if none found
 */
export function findTags(buffer: string): CompleteTagPair | null {
	let result = null;

	for (const tagPair of REASONING_TAGS) {
		const openIndex = buffer.indexOf(tagPair.openTag);
		const closeIndex = buffer.indexOf(tagPair.closeTag);

		// Check if both tags exist and are properly ordered
		if (openIndex !== -1 && closeIndex !== -1 && openIndex < closeIndex) {
			// If we don't have a result yet, or this pair starts earlier, use this one
			if (result === null || openIndex < result.openIndex) {
				result = {
					...tagPair,
					openIndex,
					closeIndex
				};
			}
		}
	}

	return result;
}

/**
 * Helper function to find the first opening tag in buffer
 * Returns tag data or null if none found
 */
export function findFirstOpeningTag(buffer: string): TagWithPosition | null {
	let firstTag = null;
	let firstIndex = Infinity;

	for (const tagPair of REASONING_TAGS) {
		const index = buffer.indexOf(tagPair.openTag);
		if (index !== -1 && index < firstIndex) {
			firstIndex = index;
			firstTag = { ...tagPair, index };
		}
	}

	return firstIndex < Infinity ? firstTag : null;
}

/**
 * Helper function to find the first closing tag in buffer
 */
export function findFirstClosingTag(
	buffer: string,
	currentTagPair: TagPair | null
): TagWithPosition | null {
	let firstTag = null;
	let firstIndex = Infinity;

	// If we know the current tag pair, prioritize its closing tag
	if (currentTagPair) {
		const index = buffer.indexOf(currentTagPair.closeTag);
		if (index !== -1) {
			return { ...currentTagPair, index };
		}
	}

	// Otherwise check all possible closing tags
	for (const tagPair of REASONING_TAGS) {
		const index = buffer.indexOf(tagPair.closeTag);
		if (index !== -1 && index < firstIndex) {
			firstIndex = index;
			firstTag = { ...tagPair, index };
		}
	}

	return firstIndex < Infinity ? firstTag : null;
}

/**
 * Processes a chunk of text for reasoning tags and updates the completion and reasoning content
 * Returns the updated buffer after processing
 */
export function processReasoningChunk(
	chunk: string,
	bufferChunk: string,
	isInReasoningTag: boolean,
	currentTagPair: TagPair | null,
	updateCompletion: (text: string) => void,
	updateReasoning: (text: string) => void
): { bufferChunk: string; isInReasoningTag: boolean; currentTagPair: TagPair | null } {
	// Add the current chunk to our buffer for processing
	let newBuffer = bufferChunk + chunk;
	let newIsInReasoningTag = isInReasoningTag;
	let newCurrentTagPair = currentTagPair;

	// Process the buffer repeatedly until we've handled all tags
	let continueProcessing = true;

	while (continueProcessing) {
		// Default to stopping after this iteration unless we find more to process
		continueProcessing = false;

		// Case 1: Complete thought block (has both opening and closing tags)
		const completePair = findTags(newBuffer);
		if (completePair) {
			const start = completePair.openIndex + completePair.openTag.length;
			const end = completePair.closeIndex;

			// Extract the content between tags as reasoning
			updateReasoning(newBuffer.slice(start, end));

			// Add content before the opening tag to completion if needed
			if (completePair.openIndex > 0) {
				updateCompletion(newBuffer.slice(0, completePair.openIndex));
			}

			// Keep content after the end tag for further processing
			newBuffer = newBuffer.slice(end + completePair.closeTag.length);

			// Continue processing if there's content left
			if (newBuffer.length > 0) {
				continueProcessing = true;
			}
		}
		// Case 2: Only opening tag found
		else {
			const openingTag = findFirstOpeningTag(newBuffer);
			if (openingTag) {
				newIsInReasoningTag = true;
				newCurrentTagPair = openingTag;

				// Add content before the tag to completion
				if (openingTag.index > 0) {
					updateCompletion(newBuffer.slice(0, openingTag.index));
				}

				// Remove content up to and including the opening tag
				newBuffer = newBuffer.slice(openingTag.index + openingTag.openTag.length);

				// We'll accumulate the reasoning in the next iteration or when end tag is found
				continueProcessing = false; // Stop and wait for more chunks
			}
			// Case 3: Only closing tag found
			else {
				const closingTag = findFirstClosingTag(newBuffer, newCurrentTagPair);
				if (closingTag) {
					// Add content before the tag to reasoning or completion based on current state
					if (newIsInReasoningTag) {
						updateReasoning(newBuffer.slice(0, closingTag.index));
					} else {
						updateCompletion(newBuffer.slice(0, closingTag.index));
					}

					newIsInReasoningTag = false;
					newCurrentTagPair = null;

					// Remove content up to and including the closing tag
					newBuffer = newBuffer.slice(closingTag.index + closingTag.closeTag.length);

					// Continue processing any remaining content
					if (newBuffer.length > 0) {
						continueProcessing = true;
					}
				}
				// Case 4: No tags found, process based on current state
				else {
					// If buffer is getting too large, process part of it
					if (newBuffer.length > 1000) {
						// Process half the buffer to avoid losing context
						const halfLength = Math.floor(newBuffer.length / 2);

						if (newIsInReasoningTag) {
							updateReasoning(newBuffer.slice(0, halfLength));
						} else {
							updateCompletion(newBuffer.slice(0, halfLength));
						}

						// Keep the rest for further processing
						newBuffer = newBuffer.slice(halfLength);
					}

					// No more processing needed for now
					continueProcessing = false;
				}
			}
		}
	}

	return {
		bufferChunk: newBuffer,
		isInReasoningTag: newIsInReasoningTag,
		currentTagPair: newCurrentTagPair
	};
}

/**
 * Process any remaining buffer content at the end of streaming
 */
export function processRemainingBuffer(
	bufferChunk: string,
	isInReasoningTag: boolean,
	updateCompletion: (text: string) => void,
	updateReasoning: (text: string) => void
): void {
	if (bufferChunk.length > 0) {
		if (isInReasoningTag) {
			updateReasoning(bufferChunk);
		} else {
			updateCompletion(bufferChunk);
		}
	}
}
