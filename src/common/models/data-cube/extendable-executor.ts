
import {ComputeOptions, Datum, DruidExternal, Expression, External, PlywoodValue} from "plywood";

export interface ExtendableExecutor {
    (ex: Expression, opt?: ComputeOptions, context?: { filters: {name: string, value: any }[]}): Promise<PlywoodValue>;
}

export interface DynamicFilterExecutorParameters {
    datasets: Datum;
}

export function dynamicFilterExecutorFactory(parameters: DynamicFilterExecutorParameters): ExtendableExecutor {
    var datasets = parameters.datasets;
    return function (ex, opt, custom) {

        if (opt === void 0) {
            opt = {};
        }

        let filteredDatasets: { [key: string]: any } = null;

        if (custom && custom.filters && custom.filters.length) {
            filteredDatasets = {};

            if (custom.filters.length > 1) {
                throw new Error('temporarily support only one dynamic filter');
            }

            const [filter] = custom.filters;

            for (var k in datasets) {
                if (!datasets.hasOwnProperty(k)) {
                    continue;
                }
                const dataset = datasets[k];
                if (dataset instanceof External) {
                    filteredDatasets[k] = cloneDruidExternal(dataset);
                    filteredDatasets[k].filter = Expression.fromJSLoose(`$${filter.name} == "${filter.value}"`);
                } else {
                    throw new Error('temporarily support external data cubes only');
                }
            }
        } else {
            filteredDatasets = datasets;
        }

        return ex.compute(filteredDatasets, opt);
    };
}

function cloneDruidExternal(external: External): External {

    if (!(external instanceof DruidExternal)) {
        throw new Error('temporarily support dynamic filter for druid only');
    }

    const clonedExternal = new DruidExternal(external.valueOf());

    return clonedExternal;
}
