'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ModelPage() {
  const router = useRouter();
  const { id } = useParams();

  const [modelData, setModelData] = useState(null);
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldHints, setFieldHints] = useState({});
  const [exclusionError, setExclusionError] = useState("");
  const [decision, setDecision] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchModel() {
      try {
        const res = await fetch(`/api/models/${id}`);
        const data = await res.json();
        if (data && data.data) {
          const attributes = data.data.attributes;
          setModelData(attributes);
          if (attributes.metadata && attributes.metadata.attributes) {
            const hints = {};
            attributes.metadata.attributes.forEach((input) => {
              if (input.type === "Continuous") {
                hints[input.name] = `Enter a number between ${input.domain.lower} and ${input.domain.upper}${input.domain.discrete ? " (integer)" : ""}.`;
              } else if (input.type === "Nominal") {
                hints[input.name] = `Select one of: ${input.domain.values.join(", ")}.`;
              }
            });
            setFieldHints(hints);
          }
        }
      } catch (err) {
        console.error("Error fetching model metadata:", err);
      }
    }
    if (id) fetchModel();
  }, [id]);

  // Check a condition based on its type.
  const checkCondition = (value, condition) => {
    switch (condition.type) {
      case 'EQ':
        return value === condition.threshold;
      case 'NEQ':
        return value !== condition.threshold;
      case 'LTEQ':
        return value <= condition.threshold;
      case 'GT':
        return value > condition.threshold;
      default:
        return false;
    }
  };

  const validateExclusionRules = (data, attributes, rules) => {
    if (!rules || rules.length === 0) return "";
    for (const rule of rules) {
      if (rule.type === "ValueEx") {
        const antecedents = Array.isArray(rule.antecedent)
          ? rule.antecedent
          : [rule.antecedent];
        const consequents = Array.isArray(rule.consequent)
          ? rule.consequent
          : [rule.consequent];

        const antecedentSatisfied = antecedents.every(cond => {
          const attr = attributes[cond.index];
          const userValue = data[attr.name];
          return checkCondition(userValue, cond);
        });
        if (antecedentSatisfied) {
          const consequentSatisfied = consequents.every(cond => {
            const attr = attributes[cond.index];
            const userValue = data[attr.name];
            return checkCondition(userValue, cond);
          });
          if (!consequentSatisfied) {
            return `Exclusion rule violation: When ${antecedents.map(c =>
              `${attributes[c.index].question || attributes[c.index].name} ${c.type === 'EQ' ? '=' : '≠'} ${c.threshold}`
            ).join(" and ")}, then ${consequents.map(c =>
              `${attributes[c.index].question || attributes[c.index].name} must be ${c.threshold}`
            ).join(" and ")}.`;
          }
        }
      } else if (rule.type === "BlatantEx") {
        const antecedents = Array.isArray(rule.antecedent)
          ? rule.antecedent
          : [rule.antecedent];
        const antecedentSatisfied = antecedents.every(cond => {
          const attr = attributes[cond.index];
          const userValue = data[attr.name];
          return checkCondition(userValue, cond);
        });
        if (antecedentSatisfied) {
          return `Exclusion rule violation: ${antecedents.map(c =>
            `${attributes[c.index].question || attributes[c.index].name} ${c.type === 'EQ' ? '=' : '≠'} ${c.threshold}`
          ).join(" and ")} is not allowed.`;
        }
      } else if (rule.type === "RelationshipEx") {
        const relation = rule.relation;
        const attr = attributes[relation.index];
        const userValue = data[attr.name];
        if (!checkCondition(userValue, relation)) {
          return `Exclusion rule violation: ${attr.question || attr.name} must be less than or equal to ${relation.threshold}.`;
        }
      }
    }
    return "";
  };

  const validateField = (field, value) => {
    const { type, domain } = field;
    let errorMessage = "";
    if (type === "Continuous") {
      const numVal = parseFloat(value);
      if (isNaN(numVal)) {
        errorMessage = "Please enter a numeric value.";
      } else {
        if (numVal < domain.lower || numVal > domain.upper) {
          errorMessage = `Value must be between ${domain.lower} and ${domain.upper}.`;
        }
        if (domain.discrete && !Number.isInteger(numVal)) {
          errorMessage = "Please enter an integer value.";
        }
      }
    } else if (type === "Nominal") {
      if (!domain.values.includes(value)) {
        errorMessage = `Select one of: ${domain.values.join(", ")}.`;
      }
    }
    return errorMessage;
  };

  const handleChange = (e, field) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const errorMsg = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const processValue = (field, value) => {
    return field.type === "Continuous" ? parseFloat(value) : value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDecision(null);
    setExclusionError("");

    let hasError = false;
    const errors = {};
    const processedInputData = {};

    if (modelData && modelData.metadata && modelData.metadata.attributes) {
      modelData.metadata.attributes.forEach(input => {
        const rawValue = formData[input.name];
        const value = processValue(input, rawValue);
        const errorMsg = validateField(input, value);
        if (errorMsg) {
          hasError = true;
          errors[input.name] = errorMsg;
        }
        processedInputData[input.name] = value;
      });
    }

    setFieldErrors(errors);
    if (hasError) {
      setError("Please correct the highlighted errors before submitting.");
      return;
    }

    if (modelData && modelData.exclusions) {
      const exclusionMsg = validateExclusionRules(
        processedInputData,
        modelData.metadata.attributes,
        modelData.exclusions.rules
      );
      if (exclusionMsg) {
        setExclusionError(exclusionMsg);
        setError("Your input scenario violates an exclusion rule.");
        return;
      }
    }

    try {
      const payload = {
        data: {
          type: "scenario",
          attributes: {
            input: processedInputData
          }
        }
      };

      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: id, inputData: payload }),
      });
      const result = await res.json();
      if (res.ok) {
        setDecision(result);
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to submit decision.');
    }
  };

  return (
    <div className="bg-white min-h-screen text-gray-800">
      <div className="container mx-auto p-4 max-w-screen-md">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded transition-colors"
          >
            &larr; Back
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-[#f15623] text-white py-1 px-3 rounded hover:bg-orange-600 transition-colors"
          >
            Home
          </button>
        </div>
        {modelData ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-center">{modelData.name}</h1>
            <p className="mb-6 text-center">{modelData.description}</p>
            <form onSubmit={handleSubmit} className="mb-6 space-y-4">
              {modelData.metadata &&
              modelData.metadata.attributes &&
              modelData.metadata.attributes.length > 0 ? (
                modelData.metadata.attributes.map((input) => (
                  <div key={input.name} className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      {input.question || input.name}
                    </label>
                    {input.type === "Nominal" ? (
                      <select
                        name={input.name}
                        value={formData[input.name] || ""}
                        onChange={(e) => handleChange(e, input)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f15623]"
                      >
                        <option value="">Select {input.question || input.name}</option>
                        {input.domain.values.map((option, idx) => (
                          <option key={idx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={input.name}
                        value={formData[input.name] || ""}
                        onChange={(e) => handleChange(e, input)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#f15623]"
                        placeholder={fieldHints[input.name] || ""}
                      />
                    )}
                    {fieldErrors[input.name] && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors[input.name]}</p>
                    )}
                    {!fieldErrors[input.name] && fieldHints[input.name] && (
                      <p className="text-gray-500 text-xs mt-1">{fieldHints[input.name]}</p>
                    )}
                  </div>
                ))
              ) : (
                <p>No input variables defined for this model.</p>
              )}
              {exclusionError && (
                <p className="text-red-500 text-sm">{exclusionError}</p>
              )}
              <button
                type="submit"
                className="w-full bg-[#f15623] text-white py-2 rounded hover:bg-orange-600 transition-colors"
              >
                Get Decision
              </button>
            </form>
            {error && <p className="text-red-500 text-center">{error}</p>}
            {decision && (
              <div className="mt-6 p-4 border rounded">
                <h2 className="font-bold text-center">Decision Result:</h2>
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(decision, null, 2)}
                </pre>
              </div>
            )}
          </>
        ) : (
          <p className="text-center mt-8">Loading model data...</p>
        )}
      </div>
    </div>
  );
}
